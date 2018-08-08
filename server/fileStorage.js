"use strict";

const azure = require('azure-storage');
const logger = require("./logger");
const blobService = process.env.BLOB_CONNECTION_STRING ? azure.createBlobService(process.env.BLOB_CONNECTION_STRING) : null;
const azureStorageUrl = process.env.BLOB_URL;
const containerName = 'images';
const fs = require('fs');
const uploadPath = 'server/uploads';
const clientUploadPath = 'uploads';
const path = require('path');


function saveImage(quizId, quizItemId, imageFile) {
    return new Promise((resolve, reject) => {

        getExistingFilesInAzureUploadDir(quizId)
            .then(files => {
                const fileName = getFileName(quizId, quizItemId, imageFile.mimetype, files);
                logger.debug("Creating blob: " + fileName);
                blobService.createBlockBlobFromLocalFile(containerName, fileName, imageFile.path, (error) => {
                    if (!error) {
                        resolve(`${azureStorageUrl}/${containerName}/${fileName}`);
                    }
                    else {
                        reject(error);
                    }
                })
            });
    });
}

function saveImageFileSystem(quizId, quizItemId, imageFile) {
    const uploadDir = path.join(uploadPath, quizId);
    if (!fs.existsSync(uploadDir)) {
        logger.debug("Creating upload directory: " + uploadDir);
        fs.mkdirSync(uploadDir);
    }
    return getExistingFilesInUploadDir(uploadDir)
        .then(files => {
            let fileName = getFileName(quizId, quizItemId, imageFile.mimetype, files);
            fs.renameSync(imageFile.path, path.join(uploadPath, fileName));
            return path.join(clientUploadPath, fileName);
        })
}

function getFileName(quizId, quizItemId, fileType, filesInDir) {
    const duplicateCount = filesInDir
        .filter(fileName => fileName.startsWith(quizItemId))
        .length;
    return `${quizId}/${quizItemId}${duplicateCount > 0 ? "-" + duplicateCount : ""}.${extractExtension(fileType)}`;
}


function getExistingFilesInUploadDir(uploadDir) {
    return new Promise((resolve, reject) => {
        fs.readdir(uploadDir, function(error, items) {
            if (!error) {
                resolve(items);
            }
            else {
                reject(error);
            }
        });
    });

}

function getExistingFilesInAzureUploadDir(quizId) {
    return new Promise((resolve, reject) => {
        blobService.listBlobsSegmented(containerName, null, function (error, result) {
            if (!error) {
                const existingFilesInDir = result.entries
                    .map(item => item.name)
                    .filter(fileName => fileName.startsWith(quizId))
                    .map(fileName => fileName.replace(quizId + "/", ""));
                resolve (existingFilesInDir);
            }
            else {
                reject(error);
            }
        });
    });
}

function extractExtension(fileType) {
    const match = fileType.match(/image\/(\w+)/);
    if (match && match.length > 1) {
        return match[1];
    }
    return fileType;
}


const fileStorage = {
    saveImage: saveImage,
    saveImageFileSystem: saveImageFileSystem
};

module.exports = fileStorage;