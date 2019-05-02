const db = require("../db");
const express = require("express");
const router = new express.Router()


router.get("/", async function (req, res, next) {
    const results = await db.query(
        `SELECT code, name
         FROM companies`
    )
    
    return res.json({companies: results.rows})
})

router.get("/:code", async function (req, res, next) {
    try {
        const results = await db.query(
            `SELECT *
            FROM companies
            WHERE code = $1`,
            [req.params.code]
        )
        
        return res.json({company: results.rows})
    } catch(err) {
        return next(err)
    }
})

router.post("/", async function (req, res, next) {
    try {
        const results = await db.query(
            `INSERT INTO companies (code, name, description)
             VALUES ($1, $2, $3)
             RETURNING code, name, description`,
             [req.body.code, req.body.name, req.body.description]
        )
        
        return res.status(201).json({company: results.rows[0]})
    } catch(err) {
        return next(err)
    }
})

router.put("/:code", async function (req, res, next) {
    try {
        const results = await db.query(
            `UPDATE companies SET name=$2, description=$3
             WHERE code=$1
             RETURNING code, name, description`,
             [req.params.code, req.body.name, req.body.description]
        )
        
        return res.status(202).json({company: results.rows[0]})
    } catch(err) {
        return next(err)
    }
})

router.delete("/:code", async function (req, res, next) {
    try {
        const results = await db.query(
            `DELETE FROM companies
             WHERE code=$1`,
             [req.params.code]
        )
        
        return res.status(202).json({status: "deleted"})
    } catch(err) {
        return next(err)
    }
})


module.exports = router