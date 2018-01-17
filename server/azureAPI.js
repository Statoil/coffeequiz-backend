"use strict";

const azure = require('azure-storage');
const logger = require("./logger");
const blobService = azure.createBlobService('DefaultEndpointsProtocol=https;AccountName=coffequiz;AccountKey=+AljOizU8v++SW5d4dY1zHT2f/P63hXBwN58rYm3kzgbxTwWDD1ev/5rw1FwjY7Jscv8Ylz4UfEAX7nDBtcXBw==;EndpointSuffix=core.windows.net');
const containerName = 'images';
const fs = require('fs');
const uploadPath = 'server/uploads';
const clientUploadPath = 'uploads';
const path = require('path');


function saveImage(quizId, quizItemId, fileType, imageFile) {
    return new Promise((resolve, reject) => {

        getExistingFilesInAzureUploadDir(quizId)
            .then(files => {
                const fileName = getFileName(quizId, quizItemId, fileType, files);
                logger.debug("Creating blob: " + fileName);
                blobService.createBlockBlobFromLocalFile(containerName, fileName, imageFile.path, (error) => {
                    if (!error) {
                        resolve(getUrl(fileName));
                    }
                    else {
                        reject(error);
                    }
                })
            });
    });
}

function saveImageFileSystem(quizId, quizItemId, fileType, imageFile) {
    const uploadDir = path.join(uploadPath, quizId);
    return getExistingFilesInUploadDir(uploadDir)
        .then(files => {
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir);
            }
            let fileName = getFileName(quizId, quizItemId, fileType, files);
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

function getUrl(fileName) {
    return `https://coffequiz.blob.core.windows.net/images/${fileName}`;
}

function extractExtension(fileType) {
    const match = fileType.match(/image\/(\w+)/);
    if (match && match.length > 1) {
        return match[1];
    }
    return fileType;
}


const fileAPI = {
    saveImage: saveImage,
    saveImageFileSystem: saveImageFileSystem
};

module.exports = fileAPI;