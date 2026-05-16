<?php
/**
 * ResQ API — single entry point
 * Usage: api.php?route=<route>
 */

session_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ── Database ─────────────────────────────────────────────────────────────────
$db = new mysqli('localhost', 'root', '', 'resq_db');
if ($db->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'DB connection failed: ' . $db->connect_error]);
    exit;
}
$db->set_charset('utf8mb4');

// ── Helpers ──────────────────────────────────────────────────────────────────
function respond($data, int $code = 200): void {
    http_response_code($code);
    echo json_encode($data);
    exit;
}

function body(): array {
    return json_decode(file_get_contents('php://input'), true) ?? [];
}

function requireAuth(): void {
    if (empty($_SESSION['user_id'])) respond(['error' => 'Unauthorized'], 401);
}

function requireRole(string ...$roles): void {
    requireAuth();
    if (!in_array($_SESSION['user_role'], $roles, true) && $_SESSION['user_role'] !== 'admin') {
        respond(['error' => 'Forbidden'], 403);
    }
}

function esc(string $v): string {
    global $db;
    return $db->real_escape_string($v);
}

// ── Router ───────────────────────────────────────────────────────────────────
$route  = $_GET['route']  ?? '';
$method = $_SERVER['REQUEST_METHOD'];

switch ($route) {

    // ── Auth ─────────────────────────────────────────────────────────────────
    case 'login':
        if ($method !== 'POST') respond(['error' => 'Method not allowed'], 405);
        $b = body();
        $email = esc($b['email'] ?? '');
        $res = $db->query("SELECT * FROM users WHERE email='$email' LIMIT 1");
        $user = $res->fetch_assoc();
        if (!$user || !password_verify($b['password'] ?? '', $user['password'])) {
            respond(['error' => 'Invalid email or password'], 401);
        }
        $_SESSION['user_id']   = $user['id'];
        $_SESSION['user_role'] = $user['role'];
        $_SESSION['user_name'] = $user['name'];
        unset($user['password']);
        respond(['user' => $user]);

    case 'register':
        if ($method !== 'POST') respond(['error' => 'Method not allowed'], 405);
        $b = body();
        $name  = esc(trim($b['name']  ?? ''));
        $email = esc(trim($b['email'] ?? ''));
        $role  = in_array($b['role'] ?? '', ['buyer','seller','foodbank']) ? $b['role'] : 'buyer';
        if (!$name || !$email || empty($b['password'])) respond(['error' => 'All fields required'], 400);
        if ($db->query("SELECT id FROM users WHERE email='$email'")->num_rows > 0)
            respond(['error' => 'Email already registered'], 409);
        $hash = password_hash($b['password'], PASSWORD_DEFAULT);
        $db->query("INSERT INTO users (name,email,password,role) VALUES ('$name','$email','$hash','$role')");
        $uid = $db->insert_id;
        $_SESSION['user_id'] = $uid; $_SESSION['user_role'] = $role; $_SESSION['user_name'] = $name;
        respond(['user' => ['id'=>$uid,'name'=>$name,'email'=>$email,'role'=>$role]]);

    case 'logout':
        session_destroy();
        respond(['message' => 'Logged out']);

    case 'me':
        requireAuth();
        $id  = (int)$_SESSION['user_id'];
        $res = $db->query("SELECT id,name,email,role,created_at FROM users WHERE id=$id");
        respond(['user' => $res->fetch_assoc()]);

    // ── Listings ─────────────────────────────────────────────────────────────
    case 'listings':
        if ($method === 'GET') {
            $conds = ["l.status='active'"];
            if (!empty($_GET['category']))   $conds[] = "l.category='"   . esc($_GET['category']) . "'";
            if (isset($_GET['is_donation'])) $conds[] = "l.is_donation=" . (int)$_GET['is_donation'];
            if (!empty($_GET['search'])) {
                $s = esc($_GET['search']);
                $conds[] = "(l.title LIKE '%$s%' OR l.description LIKE '%$s%' OR l.category LIKE '%$s%')";
            }
            $where = implode(' AND ', $conds);
            $res   = $db->query(
                "SELECT l.*,u.name AS seller_name
                 FROM listings l JOIN users u ON l.seller_id=u.id
                 WHERE $where ORDER BY l.created_at DESC"
            );
            $rows = [];
            while ($r = $res->fetch_assoc()) $rows[] = $r;
            respond(['listings' => $rows]);
        }

        if ($method === 'POST') {
            requireRole('seller');
            $b   = body();
            $sid = (int)$_SESSION['user_id'];
            $title = esc($b['title'] ?? '');
            $desc  = esc($b['description'] ?? '');
            $cat   = esc($b['category'] ?? '');
            $orig  = (float)($b['original_price'] ?? 0);
            $disc  = (float)($b['discounted_price'] ?? 0);
            $qty   = (int)($b['quantity'] ?? 1);
            $exp   = esc($b['expiry_date'] ?? date('Y-m-d', strtotime('+7 days')));
            $don   = (int)($b['is_donation'] ?? 0);
            if (!$title) respond(['error' => 'Title is required'], 400);
            $db->query(
                "INSERT INTO listings (seller_id,title,description,category,original_price,discounted_price,quantity,expiry_date,is_donation)
                 VALUES ($sid,'$title','$desc','$cat',$orig,$disc,$qty,'$exp',$don)"
            );
            respond(['message' => 'Listing created', 'id' => $db->insert_id], 201);
        }
        respond(['error' => 'Method not allowed'], 405);

    case 'listing':
        $id = (int)($_GET['id'] ?? 0);
        if ($method === 'GET') {
            $res     = $db->query("SELECT l.*,u.name AS seller_name FROM listings l JOIN users u ON l.seller_id=u.id WHERE l.id=$id");
            $listing = $res->fetch_assoc();
            if (!$listing) respond(['error' => 'Listing not found'], 404);
            respond(['listing' => $listing]);
        }
        if ($method === 'DELETE') {
            requireAuth();
            $uid  = (int)$_SESSION['user_id'];
            $role = $_SESSION['user_role'];
            if ($role === 'admin') $db->query("UPDATE listings SET status='removed' WHERE id=$id");
            else                   $db->query("UPDATE listings SET status='removed' WHERE id=$id AND seller_id=$uid");
            respond(['message' => 'Listing removed']);
        }
        if ($method === 'PUT') {
            requireRole('seller');
            $b   = body();
            $uid = (int)$_SESSION['user_id'];
            $sets = [];
            if (isset($b['title']))            $sets[] = "title='"            . esc($b['title'])            . "'";
            if (isset($b['description']))      $sets[] = "description='"      . esc($b['description'])      . "'";
            if (isset($b['category']))         $sets[] = "category='"         . esc($b['category'])         . "'";
            if (isset($b['original_price']))   $sets[] = "original_price="    . (float)$b['original_price'];
            if (isset($b['discounted_price'])) $sets[] = "discounted_price="  . (float)$b['discounted_price'];
            if (isset($b['quantity']))         $sets[] = "quantity="          . (int)$b['quantity'];
            if (isset($b['expiry_date']))      $sets[] = "expiry_date='"      . esc($b['expiry_date'])      . "'";
            if (!$sets) respond(['error' => 'Nothing to update'], 400);
            $db->query("UPDATE listings SET " . implode(',', $sets) . " WHERE id=$id AND seller_id=$uid");
            respond(['message' => 'Listing updated']);
        }
        respond(['error' => 'Method not allowed'], 405);

    // ── Orders ────────────────────────────────────────────────────────────────
    case 'orders':
        if ($method === 'POST') {
            requireRole('buyer');
            $b   = body();
            $bid = (int)$_SESSION['user_id'];
            $lid = (int)($b['listing_id'] ?? 0);
            $qty = max(1, (int)($b['quantity'] ?? 1));
            $res = $db->query("SELECT * FROM listings WHERE id=$lid AND status='active' AND is_donation=0");
            $l   = $res->fetch_assoc();
            if (!$l)             respond(['error' => 'Listing not available'], 404);
            if ($l['quantity'] < $qty) respond(['error' => 'Insufficient quantity available'], 400);
            $total = round($l['discounted_price'] * $qty, 2);
            $db->query("INSERT INTO orders (listing_id,buyer_id,quantity,total_price) VALUES ($lid,$bid,$qty,$total)");
            $db->query("UPDATE listings SET quantity=quantity-$qty WHERE id=$lid");
            $db->query("UPDATE listings SET status='sold' WHERE id=$lid AND quantity<=0");
            respond(['message' => 'Order placed successfully!', 'id' => $db->insert_id], 201);
        }
        if ($method === 'GET') {
            requireAuth();
            $uid  = (int)$_SESSION['user_id'];
            $role = $_SESSION['user_role'];
            if ($role === 'buyer') {
                $res = $db->query(
                    "SELECT o.*,l.title,l.category,u.name AS seller_name
                     FROM orders o JOIN listings l ON o.listing_id=l.id JOIN users u ON l.seller_id=u.id
                     WHERE o.buyer_id=$uid ORDER BY o.created_at DESC"
                );
            } else {
                $res = $db->query(
                    "SELECT o.*,l.title,l.category,u.name AS buyer_name
                     FROM orders o JOIN listings l ON o.listing_id=l.id JOIN users u ON o.buyer_id=u.id
                     WHERE l.seller_id=$uid ORDER BY o.created_at DESC"
                );
            }
            $rows = [];
            while ($r = $res->fetch_assoc()) $rows[] = $r;
            respond(['orders' => $rows]);
        }
        respond(['error' => 'Method not allowed'], 405);

    // ── Donations ─────────────────────────────────────────────────────────────
    case 'donations':
        if ($method === 'POST') {
            requireRole('foodbank');
            $b   = body();
            $fid = (int)$_SESSION['user_id'];
            $lid = (int)($b['listing_id'] ?? 0);
            $qty = max(1, (int)($b['quantity'] ?? 1));
            $res = $db->query("SELECT * FROM listings WHERE id=$lid AND is_donation=1 AND status='active'");
            $l   = $res->fetch_assoc();
            if (!$l) respond(['error' => 'Donation listing not available'], 404);
            if ($l['quantity'] < $qty) respond(['error' => 'Insufficient quantity available'], 400);
            $db->query("INSERT INTO donations (listing_id,foodbank_id,quantity) VALUES ($lid,$fid,$qty)");
            $db->query("UPDATE listings SET quantity=quantity-$qty WHERE id=$lid");
            $db->query("UPDATE listings SET status='sold' WHERE id=$lid AND quantity<=0");
            respond(['message' => 'Donation claimed successfully!', 'id' => $db->insert_id], 201);
        }
        if ($method === 'GET') {
            requireRole('foodbank');
            $fid = (int)$_SESSION['user_id'];
            $res = $db->query(
                "SELECT d.*,l.title,l.category,u.name AS seller_name
                 FROM donations d JOIN listings l ON d.listing_id=l.id JOIN users u ON l.seller_id=u.id
                 WHERE d.foodbank_id=$fid ORDER BY d.created_at DESC"
            );
            $rows = [];
            while ($r = $res->fetch_assoc()) $rows[] = $r;
            respond(['donations' => $rows]);
        }
        respond(['error' => 'Method not allowed'], 405);

    // ── Seller ────────────────────────────────────────────────────────────────
    case 'seller/listings':
        requireRole('seller');
        $sid = (int)$_SESSION['user_id'];
        $res = $db->query("SELECT * FROM listings WHERE seller_id=$sid ORDER BY created_at DESC");
        $rows = [];
        while ($r = $res->fetch_assoc()) $rows[] = $r;
        respond(['listings' => $rows]);

    // ── Admin ─────────────────────────────────────────────────────────────────
    case 'admin/users':
        requireRole('admin');
        $res = $db->query("SELECT id,name,email,role,created_at FROM users ORDER BY created_at DESC");
        $rows = [];
        while ($r = $res->fetch_assoc()) $rows[] = $r;
        respond(['users' => $rows]);

    case 'admin/listings':
        requireRole('admin');
        $res = $db->query(
            "SELECT l.*,u.name AS seller_name FROM listings l JOIN users u ON l.seller_id=u.id ORDER BY l.created_at DESC"
        );
        $rows = [];
        while ($r = $res->fetch_assoc()) $rows[] = $r;
        respond(['listings' => $rows]);

    case 'admin/stats':
        requireRole('admin');
        $q = fn(string $sql) => $db->query($sql)->fetch_assoc()['c'];
        respond(['stats' => [
            'total_users'     => $q("SELECT COUNT(*) c FROM users"),
            'total_listings'  => $q("SELECT COUNT(*) c FROM listings"),
            'active_listings' => $q("SELECT COUNT(*) c FROM listings WHERE status='active'"),
            'total_orders'    => $q("SELECT COUNT(*) c FROM orders"),
            'total_donations' => $q("SELECT COUNT(*) c FROM donations"),
            'food_saved_kg'   => $q("SELECT COALESCE(SUM(quantity*0.5),0) c FROM orders") + $q("SELECT COALESCE(SUM(quantity*1.0),0) c FROM donations"),
        ]]);

    default:
        respond(['error' => "Route '$route' not found", 'available_routes' => [
            'login','register','logout','me',
            'listings','listing','orders','donations',
            'seller/listings','admin/users','admin/listings','admin/stats'
        ]], 404);
}
