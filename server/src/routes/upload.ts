import { Router } from 'express';
import ImageKit from 'imagekit';
import ImageDBModel from '../models/ImageDB.model';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const { IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, IMAGEKIT_URL_ENDPOINT } = process.env;

if (!IMAGEKIT_PUBLIC_KEY || !IMAGEKIT_PRIVATE_KEY || !IMAGEKIT_URL_ENDPOINT) {
    throw new Error(
        'Missing ImageKit environment variables. Set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINT.'
    );
}

const imagekit = new ImageKit({
    publicKey: IMAGEKIT_PUBLIC_KEY,
    privateKey: IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: IMAGEKIT_URL_ENDPOINT
});

function makeThumbnailUrl(filePath: string) {
    return imagekit.url({
        path: filePath,
        transformation: [
            {
                height: 200,
                width: 200,
                aspectRatio: '1:1',
                cropMode: 'thumb'
            }
        ]
    });
}

router.post('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.user?.id;
        console.log('🚀 ~ upload.ts:37 ~ userId:', userId);
        const { base64, fileName, mimeType } = req.body as {
            base64?: string;
            fileName?: string;
            mimeType?: string;
        };

        if (!userId) {
            return res.status(401).json({ message: 'Authentication required.' });
        }

        if (!base64 || !fileName || !mimeType) {
            return res.status(400).json({ message: 'base64, fileName, and mimeType are required.' });
        }

        const cleanedBase64 = base64.replace(/^data:.*;base64,/, '');
        const uploadResult = await imagekit.upload({
            file: Buffer.from(cleanedBase64, 'base64'),
            fileName,
            folder: '/mcc/uploads',
            useUniqueFileName: true,
            isPrivateFile: false,
            tags: ['mobile-backup']
        });

        const thumbnailUrl = makeThumbnailUrl(uploadResult.filePath);
        const record = await ImageDBModel.query().insert({
            user_id: userId,
            imagekit_file_id: uploadResult.fileId, // ✅ FIXED
            file_name: fileName,
            mime_type: mimeType,
            original_url: uploadResult.url,
            thumbnail_url: thumbnailUrl,
            status: 'uploaded',
            metadata: {
                width: uploadResult.width,
                height: uploadResult.height
            }
        });
        return res.status(201).json({ ...record, thumbnail_url: thumbnailUrl });
    } catch (error) {
        console.error('Upload error:', error);
        return res.status(500).json({ message: 'Upload failed', error: (error as Error).message });
    }
});

router.get('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Authentication required.' });
        }

        const rows = await ImageDBModel.query().where({ user_id: userId }).orderBy('uploaded_at', 'desc').limit(50);
        return res.json(rows);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to read uploads.' });
    }
});

export { router as uploadRouter };
