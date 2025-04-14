import { v4 as uuidv4 } from 'uuid';
import { FastifyRequest, FastifyReply } from 'fastify'
import { supabase } from "../../services/supabase.js";
import { UploadFileType } from "./schemas.js";


export const uploadFile = async (request: FastifyRequest<UploadFileType>, reply: FastifyReply) => {
    try {
        const file = await request.file();

        if (!file) {
            return reply.code(400).send({
                status: 'error',
                message: 'No file uploaded',
            });
        }

        const fileBuffer = await file.toBuffer();
        const fileName = `${uuidv4()}-${file?.filename}`;
        const contentType = file?.type;

        const { data, error } = await supabase.storage
            .from('uploads')
            .upload(fileName, fileBuffer, {
                contentType,
                upsert: false
            });

        if (error) {
            return reply.code(400).send({
                status: 'error',
                message: error.message,
            });
        }

        const { data: uploadedFileData } = supabase.storage
            .from('uploads')
            .getPublicUrl(fileName);




        reply.send({
            status: 'success',
            data: uploadedFileData
        });
    } catch (error) {
        console.log("error", error);
        reply.code(400).send({
            status: 'error',
            error: (error as Error).message
        });
    }
};
