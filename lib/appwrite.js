import { Account, Avatars, Client, Databases, ID, Query, Storage } from 'react-native-appwrite';

export const appwriteConfig = {
    endpoint: "https://cloud.appwrite.io/v1",
    platform: "com.ag.aora",
    projectId: "66293cba980d32b51e06",
    databaseId: "66293e752caf6c3c7767",
    userCollectionId: "66293e980d3dad55a067",
    videoCollectionId: "66293ebd7d6eff715bff",
    storageId: "6629402ec6639078d9d1"
}

const client = new Client();

client
    .setEndpoint(appwriteConfig.endpoint) // Your Appwrite Endpoint
    .setProject(appwriteConfig.projectId) // Your project ID
    .setPlatform(appwriteConfig.platform);

const account = new Account(client);
const avatars = new Avatars(client);
const database = new Databases(client);
const storage = new Storage(client)

export const createUser = async (email, password, username) => {
    try {
        const newAccount = await account.create(ID.unique(),
            email,
            password,
            username
        )
        if (!newAccount) throw Error;

        const avatarUrl = avatars.getInitials(username);
        await signIn(email, password);

        const newUser = await database.createDocument(appwriteConfig.databaseId, appwriteConfig.userCollectionId, ID.unique(), {
            accountId: newAccount.$id,
            email,
            username,
            avatar: avatarUrl
        });
        return newUser;
    } catch (error) {
        console.log(error);
        throw new Error(error)
    }
}

export const signIn = async (email, password) => {
    try {
        const session = await account.createEmailSession(email, password)
        return session
    } catch (error) {
        throw new Error(error)
    }
}

export const getCurrentUser = async () => {
    try {
        const currentAccount = await account.get();
        if (!currentAccount) throw Error;

        const currentUser = await database.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal('accountId', currentAccount.$id)]
        );

        if (!currentUser) throw Error;

        return currentUser.documents[0]

    } catch (error) {
        console.log(error);
    }
}

export const getAllPosts = async () => {
    try {
        const posts = await database.listDocuments(appwriteConfig.databaseId, appwriteConfig.videoCollectionId);
        return posts.documents;
    } catch (error) {
        throw new Error(error)
    }
}


export const getLatestPosts = async () => {
    try {
        const posts = await database.listDocuments(appwriteConfig.databaseId, appwriteConfig.videoCollectionId, [Query.orderDesc('$createdAt', Query.limit(7))]);
        return posts.documents;
    } catch (error) {
        throw new Error(error)
    }
}

export const searchPosts = async (query) => {
    try {
        const posts = await database.listDocuments(appwriteConfig.databaseId, appwriteConfig.videoCollectionId, [Query.search('title', query)]);
        return posts.documents;
    } catch (error) {
        throw new Error(error)
    }
}


export const getPostsByUserId = async (userId) => {
    try {
        const posts = await database.listDocuments(appwriteConfig.databaseId, appwriteConfig.videoCollectionId, [Query.equal('creator', userId)]);
        return posts.documents;
    } catch (error) {
        throw new Error(error)
    }
}

export const singOut = async () => {
    try {
        const session = await account.deleteSession('current');
        return session;
    } catch (error) {
        throw new Error(error)
    }
}

export const getFilePreview = async (fileId, type) => {
    let fileUrl;

    try {
        if (type === 'video') {
            fileUrl = storage.getFileView(appwriteConfig.storageId, fileId)
        } else if (type === 'image') {
            fileUrl = storage.getFilePreview(appwriteConfig.storageId, fileId, 2000, 2000, 'top', 100)
        } else {
            throw new Error('Invalid File Type')
        }

        if (!fileUrl) throw Error

        return fileUrl


    } catch (error) {
        throw new Error(error)
    }
}

export const uploadFile = async (file, type) => {
    if (!file) return

    const asset = {
        name: file.fileName,
        type: file.mimeType,
        size: file.filesize,
        uri: file.uri
    }



    try {
        const uploadedFile = await storage.createFile(
            appwriteConfig.storageId,
            ID.unique(),
            asset
        );

        const fileUrl = await getFilePreview(uploadedFile.$id, type);
        return fileUrl;
    } catch (error) {
        throw new Error(error)
    }
}


export const createVideo = async (form) => {
    try {
        const [thumbnailUrl, videoUrl] = await Promise.all([
            uploadFile(form.thumbnail, 'image'),
            uploadFile(form.video, 'video')
        ]);

        const newPost = await database.createDocument(appwriteConfig.databaseId, appwriteConfig.videoCollectionId, ID.unique(), {
            title: form?.title,
            thumbnail: thumbnailUrl,
            video: videoUrl,
            prompt: form?.prompt,
            creator: form?.userId
        });

        return newPost
    } catch (error) {
        throw new Error(error)
    }
}


