const express = require('express');
const path = require('path');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

// Importar el modelo de datos
const Invitado = require('./modeloUser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Archivos estáticos
app.use(express.static(path.join(__dirname)));

// Proceso para obtener los datos de invitación personalizada
app.get('/invitacion/:id', async (req, res) => {
    try {
        const invitado = await Invitado.findById(req.params.id);
        if (!invitado) {
            return res.status(404).send('Invitado no encontrado');
        }

        res.send(`
            <html>
            <head>
                <style>
                    body {
                        font-family: 'Josefin Slab', serif;
                        background-color: #f8f9fa;
                        text-align: center;
                        color: #343a40;
                    }
                    .container {
                        margin: 50px auto;
                        padding: 20px;
                        border: 1px solid #ced4da;
                        border-radius: 10px;
                        max-width: 600px;
                        background-color: white;
                    }
                    h1 {
                        font-family: 'Lancelot', cursive;
                        font-size: 2.5em;
                        color: #007bff;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Invitación a la Boda</h1>
                    <p>Hola <strong>${invitado.name}</strong>,</p>
                    <p>Nos complace invitarte a nuestra boda: Alejandra y Roberto.</p>
                    <p><strong>Fecha:</strong> 24 de Mayo de 2025</p>
                    <p><strong>Ubicación:</strong> Terraza las Palmas, Calle Roble NO.28, CP.48540 Tecolotlán, Jal.</p>
                    <p>¡Esperamos verte allí!</p>
                </div>
            </body>
            </html>
        `);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al generar la invitación');
    }
});

// Conexión con el correo electronico
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'personalsolares@gmail.com',
        pass: 'fneu pqom vyxr bpbm' // La contraseña de aplicación generada
    }
});

// Diseño de la invitación
const enviarInvitacion = async (invitado) => {
    let info = await transporter.sendMail({
        from: '"Boda de Alejandra y Roberto" <tu_correo@gmail.com>',
        to: invitado.email,
        subject: "Invitación a la Boda",
        html: `
            <div style="font-family: 'Josefin Slab', serif; text-align: center; background-color: #f8f9fa; padding: 20px;">
                <div style="background-color: #ffffff; padding: 20px; border-radius: 10px; max-width: 600px; margin: auto; border: 1px solid #dddddd;">
                    <div style="background-image: url('https://your-image-url.com/background.jpg'); background-size: cover; padding: 30px; border-radius: 10px;">
                        <h1 style="color: #ff6f61; font-family: 'Lancelot', cursive; font-size: 2.5em;">Alejandra y Roberto</h1>
                        <p style="color: #555555; font-size: 1.2em;">Hola <strong>${invitado.name}</strong>,</p>
                        <p style="color: #555555;">Nos complace invitarte a la boda de <strong>Alejandra y Roberto</strong>.</p>
                        <p style="color: #555555;"><strong>Fecha:</strong> 24 de Mayo de 2025</p>
                        <p style="color: #555555;"><strong>Ceremonia religiosa:</strong> Parroquia del Sagrado Corazón de Jesús, Calle Gil Preciado NO.11, Zona Centro, Tecolotlán Jal.</p>
                        <p style="color: #555555;"><strong>Evento social:</strong> Terraza las Palmas, Calle Roble NO.28, CP.48540 Tecolotlán, Jal.</p>
                        <p style="color: #555555; font-size: 1.1em;">¡Nos gustaria contar con tu valiosa presencia!</p>
                    </div>
                    <img src="https://your-image-url.com/footer-image.jpg" alt="Decorative Image" style="max-width: 100%; border-radius: 10px;">
                </div>
            </div>
        `
    });

    console.log("Message sent: %s", info.messageId);
};

//Envío de mansaje de whatsapp
const enviarWhatsAppLink = (telefono, mensaje) => {
    const mensajeCodificado = encodeURIComponent(mensaje);
    return `https://wa.me/${telefono}?text=${mensajeCodificado}`;
};

//Conexión
const DB_URI = 'mongodb+srv://solares98:pRJok8x5xLawo2Yi@solares9.zz306.mongodb.net/Prueba';

async function connectDB() {
    try {
        await mongoose.connect(DB_URI);
        console.log("Conexión exitosa a la base de datos");
    } catch (error) {
        console.error("Error al conectar a la base de datos:", error);
    }
}

connectDB();

// Ruta para la página principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Routes
app.post('/submit', async (req, res) => {
    try {
        const nuevoInvitado = new Invitado({
            name: req.body.name,
            phone: req.body.phone,
            email: req.body.email,
            children: req.body.children
        });
        await nuevoInvitado.save();

        // Enviar el correo electrónico
        await enviarInvitacion(nuevoInvitado);

        // Generar enlace de WhatsApp
        const mensaje = `Hola mi nombre es: ${nuevoInvitado.name}, confirmo mi asistencia para su ceremonia!`;
        const whatsappLink = enviarWhatsAppLink(nuevoInvitado.phone, mensaje);

        // Redirigir a la página de confirmación o mostrar el enlace de WhatsApp
        res.status(200).send(`Formulario enviado correctamente. <a href="${whatsappLink}" target="_blank">Haz clic aquí para enviar un mensaje de WhatsApp.</a>`);
    } catch (error) {
        console.error('Error en /submit:', error);
        res.status(500).send('Error al procesar la solicitud.');
    }
});

// Server listening
app.listen(3000, () => {
    console.log('Server running on port 3000');
});