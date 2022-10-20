import express from "express"
import q2m from "query-to-mongo"
import BooksModel from "./model.js"

const booksRouter = express.Router()

booksRouter.get("/", async (req, res, next) => {
  try {
    const mongoQuery = q2m(req.query)

    const { total, books } = await BooksModel.findBooksWithAuthors(mongoQuery)
    res.send({
      links: mongoQuery.links("http://localhost:3001/books", total),
      total,
      totalPages: Math.ceil(total / mongoQuery.options.limit),
      books,
    })
  } catch (error) {
    next(error)
  }
})

booksRouter.post("/", async (req, res, next) => {
  try {
    const newBook = new BooksModel(req.body) // here it happens validation (thanks to Mongoose) of req.body, if it is not ok Mongoose will throw an error
    const { _id } = await newBook.save()
    res.status(201).send({ _id })
  } catch (error) {
    next(error)
  }
})

booksRouter.get("/:bookId", async (req, res, next) => {
  try {
    const book = await BooksModel.findById(req.params.bookId).populate({
      path: "authors",
      select: "firstName lastName",
    })
    if (book) {
      res.send(book)
    } else {
      next(createHttpError(404, `Book with id ${req.params.bookId} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

export default booksRouter
