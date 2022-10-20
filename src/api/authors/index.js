import express from "express"
import createHttpError from "http-errors"
import AuthorsModel from "./model.js"

const authorsRouter = express.Router()

authorsRouter.post("/", async (req, res, next) => {
  try {
    const newAuthor = new AuthorsModel(req.body) // here it happens validation (thanks to Mongoose) of req.body, if it is not ok Mongoose will throw an error
    const { _id } = await newAuthor.save()
    res.status(201).send({ _id })
  } catch (error) {
    next(error)
  }
})

authorsRouter.get("/", async (req, res, next) => {
  try {
    const authors = await AuthorsModel.find()
    res.send(authors)
  } catch (error) {
    next(error)
  }
})

authorsRouter.get("/:authorId", async (req, res, next) => {
  try {
    const author = await AuthorsModel.findById(req.params.authorId)
    if (author) {
      res.send(author)
    } else {
      next(
        createHttpError(404, `Author with id ${req.params.authorId} not found!`)
      )
    }
  } catch (error) {
    next(error)
  }
})

authorsRouter.put("/:authorId", async (req, res, next) => {
  try {
    const updatedAuthor = await AuthorsModel.findByIdAndUpdate(
      req.params.authorId, // WHO you want to modify
      req.body, // HOW you want to modify
      { new: true, runValidators: true } // OPTIONS. By default findByIdAndUpdate returns the record PRE-MODIFICATION. If you want to get back the updated object --> new:true
      // By default validation is off here --> runValidators: true
    )

    if (updatedAuthor) {
      res.send(updatedAuthor)
    } else {
      next(
        createHttpError(404, `Author with id ${req.params.authorId} not found!`)
      )
    }
  } catch (error) {
    next(error)
  }
})

authorsRouter.delete("/:authorId", async (req, res, next) => {
  try {
    const deletedAuthor = await AuthorsModel.findByIdAndDelete(
      req.params.authorId
    )
    if (deletedAuthor) {
      res.status(204).send()
    } else {
      next(
        createHttpError(404, `Author with id ${req.params.authorId} not found!`)
      )
    }
  } catch (error) {
    next(error)
  }
})

export default authorsRouter
