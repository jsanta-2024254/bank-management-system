'use strict';
import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        
        const options = {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        };

        const conn = await mongoose.connect(process.env.MONGO_URI, options);
        
        console.log(`MongoDB conectado: ${conn.connection.host}`);

        mongoose.connection.on('error', err => {
            console.error(`Error de conexión: ${err}`);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('MongoDB desconectado. Intentando reconectar...');
        });

    } catch (error) {
        console.error(`Error inicial de conexión: ${error.message}`);
        process.exit(1);
    }
};