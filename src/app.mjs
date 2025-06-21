import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import morgan from "morgan";
import session from "express-session";
import chalk from "chalk";
import flash from "connect-flash";
import { isAdmin } from './middlewares/auth.mjs';
import methodOverride from 'method-override';
import { checkUserExists } from './middlewares/checkUserExists.mjs';
import { checkUsuarioActivo } from './middlewares/checkUserActive.mjs';
import dotenv from 'dotenv';

// Importar rutas (usando import también)
import homeRoutes from "./routes/home.mjs";
import catalogRoutes from "./routes/catalog.mjs";
import loginRoutes from "./routes/login.mjs";
import registerRoutes from "./routes/register.mjs";
import adminProductsRoutes from "./routes/admin/products.mjs";
import adminRoutes from './routes/admin/index.mjs';
import adminUsersRoutes from './routes/admin/users.mjs';
import shopCartRoutes from './routes/shopCart.mjs';
import paymentRoutes from './routes/payment.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Cargar variables de entorno
dotenv.config();

// Settings
app.set("port", process.env.PORT || 3000);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middlewares
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(flash());

app.use(
  session({
    secret: "admin",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
  })
);

app.use(methodOverride('_method'));

// Aquí usarías pool para queries en tus controladores, no como middleware

// Routes
app.use("/", homeRoutes);
app.use("/catalog", catalogRoutes);
app.use("/register", registerRoutes);
app.use("/login", loginRoutes);
app.use("/logout", loginRoutes);
app.use("/admin/products", checkUserExists, checkUsuarioActivo, isAdmin, adminProductsRoutes);
app.use('/admin', checkUserExists, checkUsuarioActivo, isAdmin, adminRoutes);
app.use('/admin/users', checkUserExists, checkUsuarioActivo, isAdmin, adminUsersRoutes);
app.use('/shop-cart', shopCartRoutes);
app.use('/payment', paymentRoutes);

app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Iniciar servidor
app.listen(app.get("port"), () => {
  const port = app.get("port");
  console.clear();
  console.log(chalk.gray('\n-------------------- SERVIDOR INICIADO ----------------------'));
  console.log(chalk.blueBright('🔹 Estado: ') + chalk.green('Activo'));
  console.log(chalk.blueBright('🔹 Puerto: ') + chalk.yellow(port));
  console.log(chalk.blueBright('🔹 URL:    ') + chalk.cyan(`http://localhost:${port}`));
  console.log(chalk.gray('-------------------------------------------------------------\n'));
});

