import crypto from 'crypto';

export const stripPrivateFields = (doc) => {
    if (!doc) return doc;
    const obj = doc.toObject ? doc.toObject() : JSON.parse(JSON.stringify(doc));
    const { _id, __v, passwordHash, password_hash, ...rest } = obj;
    return rest;
};

export const newId = () => {
    return crypto.randomUUID();
};
