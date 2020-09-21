//Express Setup
const express = require("express");
const app = express();
const port = 3030;

//Monk Setup
const monk = require("monk");
const dbUrl = "localhost:27017/crud_api";
const db = monk(dbUrl);

// Joi Setup
const Joi = require("joi");

// Request For the Post Method Schema
const BookPostSchema = Joi.object({
    title: Joi.string().required(),
    author: Joi.string().required(),
    length: Joi.number().integer(),
    rating: Joi.number().max(5),
});

// Request For the Put Method Schema
const BookUpdateSchema = Joi.object({
    title: Joi.string(),
    author: Joi.string(),
    length: Joi.number().integer(),
    rating: Joi.number().max(5),
});

//Working collection
const collection = db.get("documents");

db.then(() => {
    console.log(`Database connected sucessfully`);
});

//Express.json to parse the request json body into useable Javascript Objects
app.use(express.json());

//get all documents from database
app.get("/", async (req, res) => {
    const data = await collection.find();
    res.send(data);
});

//Get a Specific Document with provided ID
app.get("/:id", async (req, res) => {
    //Find the document with the given id
    const document = await collection.findOne({
        _id: req.params.id,
    });
    if (document) {
        //Send the found document in the response
        res.send(document);
    } else {
        //Send an error if the document is not found
        res.status(404).send({ error: "Document Not Found" });
    }
});

//Insert a single document in the database
app.post("/", async (req, res) => {
    try {
        //Validate the request body
        const requestData = await BookPostSchema.validateAsync(req.body);
        //Insert it in the Database
        const insertedData = await collection.insert(requestData);
        //Send a 201 (Created) status code and the newly created data object
        res.status(201).send(insertedData);
    } catch (error) {
        //In case of an error send the error object along with a 400 (Bad Request) status code
        res.send(error);
    }
});

//Update a Single Document
app.put("/:id", async (req, res) => {
    try {
        //Validate the request body
        const requestData = await BookUpdateSchema.validateAsync(req.body);
        //Find the document with the given id and update with the request data
        const updatedDocument = await collection.findOneAndUpdate(
            {
                _id: req.params.id,
            },
            { $set: requestData }
        );

        //if The document is found and updated
        if (updatedDocument) {
            //Send the updated document in the response
            res.send(updatedDocument);
        } else {
            //Otherwise send a 404 Not FOUND error code
            res.status(404).send({ error: "Document Not Found" });
        }
    } catch (error) {
        //This catch block catches errors from the validation
        //Which we send as the response
        res.send(error);
    }
});

//Delete a Single Document
app.delete("/:id", async (req, res) => {
    //Delete the document with the provided id
    const deletedDocument = await collection.findOneAndDelete({
        _id: req.params.id,
    });

    //If the Document is found
    if (deletedDocument) {
        //Send a success message and the deleted document in the response
        res.send({
            message: "Document Deleted Succesfully",
            deletedDocument: deletedDocument,
        });
    } else {
        //Otherwise send an error
        res.send({ error: "Document not found" }).status(404);
    }
});

app.listen(port, () => {
    console.log(`Listening on port http://localhost:${port}`);
});
