import express from "express"
import q2m from "query-to-mongo"
import BooksModel from "./model.js"

const booksRouter = express.Router()

booksRouter.get("/", async (req, res, next) => {
  try {
    const mongoQuery = q2m(req.query)

    const total = await BooksModel.countDocuments(mongoQuery.criteria)

    const books = await BooksModel.find(
      mongoQuery.criteria,
      mongoQuery.options.fields
    )
      .skip(mongoQuery.options.skip) // no matter the order of usage of these three methods, Mongo will always do SORT then SKIP then LIMIT
      .limit(mongoQuery.options.limit)
      .sort(mongoQuery.options.sort)
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

export default booksRouter
