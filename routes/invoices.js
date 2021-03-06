const db = require("../db");
const express = require("express");
const ExpressError = require("../expressError");
const router = new express.Router()


router.get("/", async function (req, res, next) {
    const results = await db.query(
        `SELECT id, comp_code
         FROM invoices`
    )
    
    return res.json({invoices: results.rows})
})

router.get("/:id", async function (req, res, next) {
    try {
        const results = await db.query(
            `SELECT *
            FROM invoices
            WHERE id = $1`,
            [req.params.id]
        )
        
        return res.json({invoice: results.rows})
    } catch(err) {
        return next(err)
    }
})

router.post("/", async function (req, res, next) {
    try {
        const results = await db.query(
            `INSERT INTO invoices (comp_code, amt)
             VALUES ($1, $2)
             RETURNING id, comp_code, amt, paid, add_date, paid_date`,
             [req.body.comp_code, req.body.amt]
        )
        
        return res.status(201).json({invoice: results.rows[0]})
    } catch(err) {
        return next(err)
    }
})

router.put("/:id", async function (req, res, next) {
    try {
        if (req.body.paid){
            const results = await db.query(
                `UPDATE invoices SET amt=$2, paid=$3, paid_date=CURRENT_DATE
                 WHERE id=$1
                 RETURNING id, comp_code, amt, paid, add_date, paid_date`,
                 [req.params.id, req.body.amt, req.body.paid]
            )
            
        }
        else if (req.body.paid === false){
            const results = await db.query(
                `UPDATE invoices SET amt=$2, paid=$3, paid_date=null
                WHERE id=$1
                RETURNING id, comp_code, amt, paid, add_date, paid_date`,
                [req.params.id, req.body.amt, req.body.paid]
        )
        }
        else {
            const results = await db.query(
                `UPDATE invoices SET amt=$2
                WHERE id=$1
                RETURNING id, comp_code, amt, paid, add_date, paid_date`,
                [req.params.id, req.body.amt]
            )
            return res.status(202).json({invoice: results.rows[0]})
        }
    } catch(err) {
        return next(err)
    }
})

router.delete("/:id", async function (req, res, next) {
    try {
        const results = await db.query(
            `DELETE FROM invoices
             WHERE id=$1`,
             [req.params.id]
        )
        if (results.rowCount === 0){
            throw new ExpressError("Invoice not found", 404)
        }
            
        return res.status(202).json({status: "deleted"})
    } catch(err) {
        return next(err)
    }
})


module.exports = router