import { v4 as uuidv4 } from 'uuid';
import { FastifyRequest, FastifyReply } from 'fastify'
import { supabase } from "../../../services/supabase.js";
import { UploadFileType } from "./schemas.js";
import { db } from "../../../db/index.js";
import { files } from '../../../db/schema/index.js';


export const uploadFile = async (request: FastifyRequest<UploadFileType>, reply: FastifyReply) => {
    try {
        const file = await request.file();

        if (!file) {
            return reply.code(400).send({
                success: false,
                message: 'No file uploaded',
            });
        }

        const fileBuffer = await file.toBuffer();
        const fileName = `${uuidv4()}-${file?.filename}`;
        const contentType = file?.type;

        const originalName = file.filename!;
        const size = fileBuffer.length;
        const mimeType = file.mimetype;
        const extension = originalName.split('.').pop();
        const { data, error } = await supabase.storage
            .from('uploads')
            .upload(fileName, fileBuffer, {
                contentType,
                upsert: false
            });

        if (error) {
            return reply.code(400).send({
                success: false,
                message: error.message,
            });
        }

        const { data: uploadedFileData } = supabase.storage
            .from('uploads')
            .getPublicUrl(fileName);

        const [fileMeta] = await db.insert(files).values({
            fileName: fileName,
            bucket: 'uploads',
            originalName: originalName,
            extension: extension || '',
            mimeType: mimeType,
            size: size,
            url: uploadedFileData.publicUrl,
        }).returning();


        reply.send({
            success: true,
            data: fileMeta
        });
    } catch (error) {
        console.log("error", error);
        reply.code(400).send({
            success: false,
            error: (error as Error).message
        });
    }
};
