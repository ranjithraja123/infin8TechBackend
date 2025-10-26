// const { poolPromise } = require("../config/db");
// const { default: Categories } = require("../models/categories.model");

import Categories from "../models/categories.model.js";
import Expense from "../models/expense.model.js";
import Merchant from "../models/merchant.model.js";
import mongoose from "mongoose";


const saveExpense = async (req, res) => {
    try {
        let expArr;

        if (typeof req.body.expArr === 'string') {
            expArr = JSON.parse(req.body.expArr);
        } else {
            expArr = req.body.expArr;
        }

        const fileMap = {};
        req.files.forEach(file => {
            fileMap[file.originalname] = file.filename;
        })

        console.log(fileMap, "fileMap")

        // const pool = await poolPromise;

        await Promise.all(expArr.map(async (exp) => {
            let {
                userid,
                orgid,
                merchant,
                ExpenseDate,
                total,
                currency,
                reimbursable,
                category,
                description,
                report,
                status = 'O',
                ReceiptName
            } = exp;
            const expdate = new Date(ExpenseDate).toISOString();
            // if(reimbursable === true){
            //     status = 'R'
            // }
            // if(!merchant){
            //     return res.status(400).json({message:"Please fill in the required fields"})
            // }

            const storedFileName = fileMap[ReceiptName] || null

            const newExpense = new Expense({
                userId: userid,
                orgid,
                merchant,
                expdate: ExpenseDate,
                total,
                currency,
                reimbursable,
                category,
                description,
                report,
                status,
                receipt: storedFileName
            })
            await newExpense.save()

            // const query = `
            //     SELECT save_expense($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            // `;

            // const values = [
            //     userid,
            //     orgid,
            //     merchant,
            //     expdate,
            //     // new Date(ExpenseDate).toISOString(),
            //     // expdate,
            //     total,
            //     currency,
            //     reimbursable,
            //     category,
            //     description,
            //     report,
            //     status,
            //     storedFileName
            // ];

            // await pool.query(query, values);
        }));

        return res.status(200).json({ message: 'Expenses saved successfully' });
    } catch (error) {
        console.error('Error saving expenses:', error);
        return res.status(500).json({ error: 'Failed to save expenses' });
    }
};




const getExpenses = async (req, res) => {
    try {
        const { logeduser, category, merchant, status, submitters, approval, from, to } = req.query;
        // const pool = await poolPromise;

        // // Build base query with JOINs
        // let query = `
        //     SELECT 
        //         e.*, 
        //         u.username,
        //         m.merchant AS merchantname,
        //         c.category AS categoryname
        //     FROM expenses e
        //     LEFT JOIN users u ON e.userid = u.wallid
        //     LEFT JOIN merchant m ON e.merchant = m.merchantid
        //     LEFT JOIN category c ON e.category = c.catid
        // `;

        // const conditions = [];
        // const values = [];

        // // Add filters
        // if (category) {
        //     conditions.push(`e.category = $${values.length + 1}`);
        //     values.push(category);
        // }
        // if (merchant) {
        //     conditions.push(`e.merchant = $${values.length + 1}`);
        //     values.push(merchant);
        // }
        // if (status) {
        //     if (status === 'billable') {
        //         conditions.push(`e.reimbursable = $${values.length + 1} AND e.status = $${values.length + 2}`);
        //         values.push('false', 'O')
        //     } else if (status === 'reimbursable') {
        //         conditions.push(`e.reimbursable = $${values.length + 1} AND e.status = $${values.length + 2}`);
        //         values.push('true', 'O')
        //     }
        // }
        // if (submitters) {
        //     if (submitters === "myExpense") {
        //         conditions.push(`e.userid = $${values.length + 1}`);
        //         values.push(logeduser)

        //     }
        //     if (submitters === "otherSubmitters") {
        //         conditions.push(`e.userid != $${values.length + 1}`);
        //         values.push(logeduser)
        //     }
        // }

        // if (approval) {
        //     if (approval === "approved") {
        //         conditions.push(`e.status = $${values.length + 1}`);
        //         values.push('A')
        //     }
        //     if (approval === "unApproved") {
        //         conditions.push(`e.status = $${values.length + 1}`);
        //         values.push('UA')
        //     }
        //     if (approval === "reimbursed") {
        //         conditions.push(`e.status = $${values.length + 1}`);
        //         values.push('R')
        //     }
        // }
        // // Add date range filter
        // if (from && to) {
        //     conditions.push(`Date(e.expdate) BETWEEN $${values.length + 1} AND $${values.length + 2}`);
        //     values.push(from, to);
        // } else if (from) {
        //     conditions.push(`Date(e.expdate) >= $${values.length + 1}`);
        //     values.push(from);
        // } else if (to) {
        //     conditions.push(`Date(e.expdate) <= $${values.length + 1}`);
        //     values.push(to);
        // }


        // if (conditions.length > 0) {
        //     query += ` WHERE ` + conditions.join(' AND ');
        // }

        // query += ` ORDER BY e.expdate DESC`;

        // const { rows } = await pool.query(query, values);

        const matchStage = {};

        if (category && mongoose.Types.ObjectId.isValid(category)) {
            matchStage.category = new mongoose.Types.ObjectId(category);
        }

        if (merchant) {
            matchStage.merchant = new mongoose.Types.ObjectId(merchant);
        }
        if (status) {
            if (status === 'billable') {
                matchStage.reimbursable = false;
                matchStage.status = 'O';
            } else if (status === 'reimbursable') {
                matchStage.reimbursable = true;
                matchStage.status = 'O';
            }
        }
        if (submitters) {
            if (submitters === "myExpense") {
                matchStage.userid = logeduser;
            }
            if (submitters === "otherSubmitters") {
                matchStage.userid = { $ne: logeduser };
            }
        }
        if (approval) {
            if (approval === "approved") {
                matchStage.status = 'A';
            }
            if (approval === "unApproved") {
                matchStage.status = 'UA';
            }
            if (approval === "reimbursed") {
                matchStage.status = 'R';
            }
        }

        // Date range filter
        if (from || to) {
            matchStage.expdate = {};
            if (from) {
                matchStage.expdate.$gte = new Date(from);
            }
            if (to) {
                matchStage.expdate.$lte = new Date(to);
            }
        }

        console.log(matchStage, "matchStage")

        const expense = await Expense.aggregate([
            { $match: matchStage },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: {
                    path: "$user",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "merchants",
                    localField: "merchant",
                    foreignField: "_id",
                    as: 'merchantData'

                }

            },
            {
                $unwind: {
                    path: "$merchantData",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "categoryData"
                }
            },
            {
                $unwind: {
                    path: "$categoryData",
                    preserveNullAndEmptyArrays: true
                }
            },
            // {
            //     $project: {
            //         _id: 1,
            //         expdate: 1,
            //         userid: 1,
            //         merchant: 1,
            //         category: 1,
            //         reimbursable: 1,
            //         status: 1,
            //         amount: 1,
            //         username: "$user.username",
            //         merchantname: "$merchantData.merchant",
            //         categoryname: "$categoryData.category"
            //     }
            // },
            { $sort: { expdate: -1 } }
        ])


        return res.status(200).json({
            message: 'Success',
            data: expense
        });

    } catch (error) {
        console.error("getExpenses error:", error);
        return res.status(500).json({ error: 'Failed to get expenses' });
    }
}



// const getExpenses = async (req, res) => {
//     try {
//         const { logeduser, category, merchant, status, submitters, approval, from, to } = req.query;

//         const matchStage = {};

//         // Apply filters (similar to SQL WHERE)
//         if (category) {
//             matchStage.category = category;
//         }
//         if (merchant) {
//             matchStage.merchant = merchant;
//         }
//         if (status) {
//             if (status === 'billable') {
//                 matchStage.reimbursable = false;
//                 matchStage.status = 'O';
//             } else if (status === 'reimbursable') {
//                 matchStage.reimbursable = true;
//                 matchStage.status = 'O';
//             }
//         }
//         if (submitters) {
//             if (submitters === "myExpense") {
//                 matchStage.userid = logeduser;
//             }
//             if (submitters === "otherSubmitters") {
//                 matchStage.userid = { $ne: logeduser };
//             }
//         }
//         if (approval) {
//             if (approval === "approved") {
//                 matchStage.status = 'A';
//             }
//             if (approval === "unApproved") {
//                 matchStage.status = 'UA';
//             }
//             if (approval === "reimbursed") {
//                 matchStage.status = 'R';
//             }
//         }

//         // Date range filter
//         if (from || to) {
//             matchStage.expdate = {};
//             if (from) {
//                 matchStage.expdate.$gte = new Date(from);
//             }
//             if (to) {
//                 matchStage.expdate.$lte = new Date(to);
//             }
//         }

//         const expenses = await Expenses.aggregate([
//             { $match: matchStage },
//             {
//                 $lookup: {
//                     from: "users",
//                     localField: "userid",
//                     foreignField: "wallid",
//                     as: "user"
//                 }
//             },
//             { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
//             {
//                 $lookup: {
//                     from: "merchant",
//                     localField: "merchant",
//                     foreignField: "merchantid",
//                     as: "merchantData"
//                 }
//             },
//             { $unwind: { path: "$merchantData", preserveNullAndEmptyArrays: true } },
//             {
//                 $lookup: {
//                     from: "category",
//                     localField: "category",
//                     foreignField: "catid",
//                     as: "categoryData"
//                 }
//             },
//             { $unwind: { path: "$categoryData", preserveNullAndEmptyArrays: true } },
//             {
//                 $project: {
//                     _id: 1,
//                     expdate: 1,
//                     userid: 1,
//                     merchant: 1,
//                     category: 1,
//                     reimbursable: 1,
//                     status: 1,
//                     amount: 1,
//                     username: "$user.username",
//                     merchantname: "$merchantData.merchant",
//                     categoryname: "$categoryData.category"
//                 }
//             },
//             { $sort: { expdate: -1 } }
//         ]);

//         return res.status(200).json({
//             message: 'Success',
//             data: expenses
//         });

//     } catch (error) {
//         console.error("getExpenses error:", error);
//         return res.status(500).json({ error: 'Failed to get expenses' });
//     }
// };




const approvalChange = async (req, res) => {
    try {
        const { expid, userid, orgid, status } = req.body;

        if (!expid || !userid || !orgid || !status) {
            return res.status(400).json({ error: 'Missing required fields: expid, userid, orgid, or status' });
        }

        // const pool = await poolPromise;

        // const query = `
        //     UPDATE expenses 
        //     SET status = $1 
        //     WHERE expid = $2 AND orgid = $3 AND userid = $4
        // `;
        // const values = [status, expid, orgid, userid];

        // const result = await pool.query(query, values);

        // if (result.rowCount === 0) {
        //     return res.status(404).json({ message: 'Expense record not found or already updated' });
        // }

        console.log(expid, expid, userid, "TEST")
        const expenseUpdate = await Expense.findOneAndUpdate({
            _id: expid,
            userId: userid,
            orgid: orgid
        }, {
            $set: {
                status: status
            }
        }, {
            new: true
        })
        if (!expenseUpdate) {
            return res.status(404).json({ message: 'Expense record not found or already updated' })
        }

        return res.status(200).json({ message: 'Status updated successfully' });

    } catch (error) {
        console.error('Error updating status:', error);
        return res.status(500).json({ error: 'Failed to change approval status', details: error.message });
    }
};


const getOganizationMerchant = async (req, res) => {
    try {
        const { orgid } = req.body

        const getMerchant = await Merchant.find({
            orgid
        })

        if (getMerchant.length === 0) {
            return res.status(404).json({ message: 'Merchant not found' })
        }

        return res.status(200).json({ message: 'Merchants found', data: getMerchant })


        // if (result.rows.length === 0) {
        //     return res.status(404).json({ message: 'No Merchants' })
        // }
        // return res.status(200).json({ message: 'Merchants found', data: result.rows })

    } catch (error) {
        return res.status(500).json({ error: 'Failed to get organization merchant' });
    }
}


const getCategories = async (req, res) => {
    try {
        const getCategories = await Categories.find({})
        if (!getCategories) {
            return res.status(404).json({ message: 'No categories found' })
        }
        return res.status(200).json({ message: 'Categories found', data: getCategories })
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get categories' });
    }
}


const addcategories = async (req, res) => {
    try {
        const categoriesArray = req.body;

        if (!Array.isArray(categoriesArray) || categoriesArray.length === 0) {
            return res.status(400).json({ error: 'Invalid categories array' });
        }

        await Categories.create(categoriesArray);

        return res.status(200).json({ message: 'Categories added successfully' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to add categories' });
    }
};



// module.exports = { addcategories, saveExpense, getExpenses, approvalChange, getOganizationMerchant, getCategories };

export default { addcategories, getCategories, getOganizationMerchant, getExpenses, saveExpense, approvalChange }
