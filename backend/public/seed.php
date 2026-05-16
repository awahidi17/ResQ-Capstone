<?php
/**
 * ResQ Demo Seeder
 * Visit: http://localhost/PHP/resq_php_react_final/backend/public/seed.php
 * Run once after importing schema.sql
 */

$db = new mysqli('localhost', 'root', '', 'resq_db');
if ($db->connect_error) die('DB Error: ' . $db->connect_error);
$db->set_charset('utf8mb4');

$pass = password_hash('password123', PASSWORD_DEFAULT);

$users = [
    ['Admin User',          'admin@resq.local',    $pass, 'admin'],
    ['Green Garden Store',  'seller@resq.local',   $pass, 'seller'],
    ['Jane Buyer',          'buyer@resq.local',    $pass, 'buyer'],
    ['Community Food Bank', 'foodbank@resq.local', $pass, 'foodbank'],
];

$db->query("DELETE FROM donations; DELETE FROM orders; DELETE FROM listings; DELETE FROM users;");

foreach ($users as [$name, $email, $pw, $role]) {
    $n  = $db->real_escape_string($name);
    $e  = $db->real_escape_string($email);
    $db->query("INSERT INTO users (name,email,password,role) VALUES ('$n','$e','$pw','$role')");
}

$sellerId = 2;
$listings = [
    [$sellerId, 'Fresh Organic Apples',  'Slightly bruised but perfectly edible organic apples from local farm.', 'Fruits',      8.00,  3.00, 10, 3,  0],
    [$sellerId, 'Artisan Bread Loaves',  'End-of-day sourdough and whole wheat loaves fresh from the oven.',     'Bakery',      6.00,  2.50,  5, 1,  0],
    [$sellerId, 'Mixed Vegetables Box',  'Assorted veggies — carrots, zucchini, bell peppers, and more.',        'Vegetables', 12.00,  5.00,  8, 2,  0],
    [$sellerId, 'Yogurt Variety Pack',   'Assorted flavours near best-before date. All still good!',             'Dairy',       9.00,  3.50,  6, 2,  0],
    [$sellerId, 'Pasta & Sauce Bundle',  'Italian pasta with marinara and pesto sauces near best-before.',       'Pantry',     11.00,  4.00,  7, 4,  0],
    [$sellerId, 'Surplus Rice Bags',     'Donated surplus rice — 5 kg bags for food banks.',                    'Grains',      0.00,  0.00, 20, 30, 1],
    [$sellerId, 'Canned Goods Bundle',   'Mixed canned beans, tomatoes, and soups perfect for food banks.',     'Pantry',      0.00,  0.00, 15, 60, 1],
    [$sellerId, 'Breakfast Cereal Box',  'Assorted breakfast cereals — lightly dented boxes, contents perfect.','Breakfast',   7.00,  2.00,  9, 5,  0],
];

foreach ($listings as [$sid, $title, $desc, $cat, $orig, $disc, $qty, $days, $don]) {
    $t  = $db->real_escape_string($title);
    $d  = $db->real_escape_string($desc);
    $c  = $db->real_escape_string($cat);
    $exp = date('Y-m-d', strtotime("+$days days"));
    $db->query("INSERT INTO listings (seller_id,title,description,category,original_price,discounted_price,quantity,expiry_date,is_donation)
                VALUES ($sid,'$t','$d','$c',$orig,$disc,$qty,'$exp',$don)");
}

echo '<h2 style="font-family:sans-serif;color:green">✅ ResQ seeded successfully!</h2>';
echo '<p style="font-family:sans-serif">Demo accounts (password: <strong>password123</strong>):<br>';
echo 'admin@resq.local | seller@resq.local | buyer@resq.local | foodbank@resq.local</p>';
