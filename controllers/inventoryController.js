const { poolPromise } = require("../config/db")

const getInventoryProducts = async (req, res) => {
    try {
        const { orgid } = req.params
        if (!orgid) {
            return res.status(400).json({ message: "Organization ID is required" })
        }
        const pool = await poolPromise;
        const query = `select * from raw_materials where orgid =$1`
        const values = [orgid]
        const result = await pool.query(query, values)
        if (result) {
            return res.status(200).json({ message: "success", data: result.rows })
        }
        return res.status(404).json({ message: "No products found" })
    } catch (error) {
        return res.status(400).json({ message: 'Error in getInventoryProducts' })
    }
}

const overallinventoryProducts = async (req, res) => {
    try {
        const { orgid } = req.params;

        if (!orgid) {
            return res.status(400).json({ message: "Organization ID is required" });
        }

        const pool = await poolPromise;
        const query = `SELECT * FROM overallinventory($1)`;
        const values = [orgid];

        const result = await pool.query(query, values);
        console.log(result)

        const data = result.rows.map((row) => {
            let unitQuantity;
            let unit;

            switch (row.q_unit) {
                case 'mg':
                    unitQuantity = row.total_quantity / 1000000;
                    unit = 'kg';
                    break;
                case 'g':
                    unitQuantity = row.total_quantity / 1000;
                    unit = 'kg';
                    break;
                case 'kg':
                    unitQuantity = row.total_quantity;
                    unit = 'kg';
                    break;
                case 'ml':
                    unitQuantity = row.total_quantity / 1000;
                    unit = 'l';
                    break;
                case 'l':
                    unitQuantity = row.total_quantity;
                    unit = 'l';
                    break;
                default:
                    unitQuantity = row.total_quantity;
                    unit = row.q_unit;
            }

            return {
                ...row,
                unitQuantity: unitQuantity,
                unit
            };
        });

        if (data.length === 0) {
            return res.status(404).json({ message: "No products found" });
        }

        return res.status(200).json({ message: "Success", data });

    } catch (error) {
        console.error("Error in overallinventoryProducts:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

const getItemDetails = async (req, res) => {
    try {
        const { itemid, catid, orgid, state } = req.params
        const pool = await poolPromise;
        const query = `select * from specificinventory($1,$2,$3,$4)`
        const values = [orgid, itemid, catid,state]
        const result = await pool.query(query, values)
        return res.status(200).json({ message: "Success", data:result.rows });

    } catch (error) {
        console.error("Error in getItemDetails:", error);
    }
}





module.exports = { getInventoryProducts, overallinventoryProducts, getItemDetails }