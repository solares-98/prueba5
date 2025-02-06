const mongoose = require('mongoose');
const Invitado = require('../modeloUser'); // Asegúrate de que el path es correcto
const nodemailer = require('nodemailer');

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Método no permitido" });
    }

    try {
        const nuevoInvitado = new Invitado({
            name: req.body.name,
            phone: req.body.phone,
            email: req.body.email,
            children: req.body.children
        });

        await nuevoInvitado.save();

        // Configurar y enviar correo
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        await transporter.sendMail({
            from: '"Boda de Alejandra y Roberto" <tu_correo@gmail.com>',
            to: nuevoInvitado.email,
            subject: "Invitación a la Boda",
            html: `<p>Hola ${nuevoInvitado.name}, nos gustaría invitarte a nuestra boda.</p>`
        });

        res.status(200).json({ message: "Invitación enviada correctamente" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error en el servidor" });
    }
}
