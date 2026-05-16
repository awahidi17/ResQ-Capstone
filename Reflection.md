# ResQ Capstone — Reflections
**Student:** Ahmad Wahidi
**Project:** ResQ — Food Rescue Marketplace
**Course:** Web Application Development (MWDWC)

---

## Self Reflection

### What I Built
For my capstone project I built ResQ, a full-stack food rescue marketplace that connects local sellers who have surplus near-expiry food with buyers who want it at a discount, and food banks that can claim donated items for free. The application supports four distinct user roles — Admin, Seller, Buyer, and Food Bank — each with their own dedicated dashboard and set of permissions.

The tech stack I chose was React 18 on the frontend with PHP 8 and MySQL on the backend, running locally through XAMPP. I used React Router v6 for client-side navigation, Bootstrap 5 with a fully custom CSS design system for the UI, and a single PHP file as a REST API router handling all backend logic.

### What I Learned
This project gave me a much deeper understanding of how all the layers of a web application connect with each other. Before this capstone I understood each piece in isolation — HTML, CSS, JavaScript, PHP, databases — but building ResQ forced me to think about how they all work together as a system.

One of the biggest things I learned was how session-based authentication works across a frontend and backend running on different ports. When I first tried to log in, the PHP session cookie was being blocked because Vite runs on port 5173 and XAMPP runs on port 80. I had to research CORS, understand what `credentials: include` does in a fetch request, and configure the Vite proxy to tunnel API calls to the PHP server. That one debugging session taught me more about how browsers handle security than any tutorial I had read.

I also learned how to design a relational database properly. I spent time thinking about which data belongs in which table, how foreign keys enforce relationships between tables, and why normalisation matters. When I added the CRM and fulfillment features later, having a clean schema made it much easier to extend without breaking anything.

Working with React Context was another major learning point. I had used local state before but managing global authentication state — keeping the user logged in across page refreshes, protecting routes based on role, and sharing that state with every component — required me to think about data flow in a completely different way.

### Challenges I Overcame
The most frustrating challenge was debugging issues that had nothing to do with my core logic. JSX parse errors caused by curly apostrophes in text strings, broken Unsplash image URLs, and terminal path issues all took time to track down. These taught me that real development work is not just writing code — it is reading error messages carefully, isolating the problem, and fixing the root cause rather than the symptom.

Another challenge was designing the role-based UI. The same listing detail page needed to show completely different action buttons depending on whether the logged-in user was a buyer, a food bank, a seller, or not logged in at all. Getting that logic right without it becoming messy required me to think carefully about component structure and conditional rendering.

### What I Would Do Differently
If I were to start over I would write more of the PHP backend using prepared statements from the beginning rather than using string escaping. I would also add proper error boundaries in React so that a failing component does not crash the whole page. Given more time I would add email notifications when an order status changes and a proper map integration to show pickup locations visually.

### Final Thoughts
ResQ started as a class project but became something I am genuinely proud of. It solves a real problem — food waste and food insecurity — and I built every part of it myself, from the database schema to the CSS design tokens to the PHP routing logic. This capstone showed me that I can take a complex idea and turn it into a working, polished application.

---

## AI Reflection

### How I Used AI Assistance
During this capstone project I used AI to help with several parts of the development process. I want to be transparent and specific about what that looked like in practice.

I used the AI primarily to help scaffold the initial project structure, generate boilerplate component code, suggest solutions to technical problems I had not encountered before, and help me debug specific errors when I was stuck. I also used it to help generate the presentation, the README documentation, and this reflection document.

Specific areas where AI assistance was most helpful included setting up the Vite proxy configuration for CORS, structuring the PHP API router with shared helper functions, designing the CSS custom property system for the design tokens, and building the CRM dashboard layout.

### How I Verified and Understood the Code
I did not simply copy and paste code without understanding it. Every file that went into my project I read through line by line. When I encountered a pattern or function I did not recognise I looked it up and made sure I understood what it was doing before keeping it.

The debugging process throughout this project is the clearest evidence of my understanding. When the app threw a JSX parse error on line 27 of Home.jsx, I read the error message, identified that curly apostrophes inside single-quoted strings were breaking the parser, and fixed it. When images were not loading I inspected the Unsplash URLs directly in the browser, identified which ones had gone dead, and replaced them with working alternatives. When `npm run dev` failed I understood from the error that I was in the wrong directory and needed to `cd frontend` first. None of those fixes were suggested by AI — I worked through them myself.

I also made deliberate changes to the AI-generated code throughout development. I adjusted the colour palette, changed the typography choices, modified the component structure to match how I wanted the dashboards to work, and added the pickup and delivery fulfillment system as a feature I specifically requested and then tested manually end to end.

### What I Learned From Using AI as a Tool
Using AI assistance taught me something important about modern software development — the tool does not replace understanding, it accelerates it. When I did not understand what a piece of code was doing, I could not debug it when it broke. The parts of the project I understand best are the parts where I hit errors, had to read the code carefully, and fixed them myself.

I think of the AI in this project the way I would think of a senior developer I could ask questions to. It could suggest approaches and write initial implementations, but I was the one who had to run the code, test every feature, catch what was wrong, explain what I wanted changed, and make sure the final result actually worked correctly.

### Learning Reflection
This project taught me that building real software is mostly about problem solving, not syntax. The syntax you can look up. What matters is being able to read an error message and know where to look, understand how the pieces of a system fit together, and keep going when something does not work the first time.

ResQ is a full-stack web application with a real database, a REST API, role-based authentication, and a polished UI. I built it, I understand how it works, and I can explain every part of it. That is what this capstone was for.
