import Merchant from "../models/merchant.model.js";
import { default as Organization } from "../models/organizations.model.js";
const addOrganization = async (req, res) => {
    try {
        const { orgName } = req.body;
        if (!orgName) {
            return res.status(400).json({ message: "Organization name is required" });
        }
        const addOrganization = new Organization({
            orgname: orgName
        })
        await addOrganization.save();

        res.status(200).json({
            message: 'Oganization registered successfully',
        });

    } catch (err) {

        res.status(400).json({ error: err.message });
    }
};

const getOrganization = async (req, res) => {
    try {
        const allOrganization = await Organization.find({}).lean()

        if (allOrganization.length === 0) {
            return res.status(400).json({
                message: "No data found"
            })
        }


        res.status(200).json({
            message: 'Organization retrieved successfully',
            organizations: allOrganization
        })
    } catch (error) {
        res.status(400).json({ error })
    }
}

//colleague request to join the organization
const colleagueRequest = async (req, res) => {
    const { orgid, username, password, email } = req.body;
    const pool = await poolPromise;
    try {
        if (!orgid || !username || !password || !email) {
            return res.status(400).json({ error: 'Please provide all the details' })
        }

        const query = 'select colleagueRequest($1,$2,$3,$4)';
        const values = [username, password, email, orgid]
        const addedRequest = await pool.query(query, values)

        if (addedRequest) {
            res.status(200).json({
                message: 'Request sent successfully',
            })
        }


    } catch (err) {
        res.status(400).json({ error: err.message })
    }
}

const getOrganizationRequest = async (req, res) => {
    const { orgid } = req.params;
    try {
        if (!orgid) {
            return res.status(200).json({ message: 'No organization id provided' })
        }
        const pool = await poolPromise;
        const query = 'select * from requests where orgid = $1';
        const values = [orgid];
        const requests = await pool.query(query, values);
        return res.status(200).json({ user: requests.rows })
    } catch (error) {
        res.status(400).json({ error })
    }
}

const addMerchant = async (req, res) => {
    try {
        const { fields } = req.body;

        if (!Array.isArray(fields) || fields.length === 0) {
            return res.status(400).json({ message: "No merchant data provided" });
        }

        const errors = [];
        const successMerchants = [];

        await Promise.all(fields.map(async (merchantObj) => {
            try {
                const { orgid, merchant, createdby } = merchantObj;

                if (!orgid || !merchant || !createdby) {
                    errors.push({ merchant: merchant || null, error: "Missing required fields" });
                    return;
                }

                const existingMerchant = await Merchant.findOne({
                    orgid,
                    merchant
                })
                if (existingMerchant) {
                    return;
                }

                const newMerchant = new Merchant({
                    orgid,
                    createdBy: createdby,
                    merchant
                });
                console.log(newMerchant, "newMerchant")

                await newMerchant.save();
                successMerchants.push(merchant);
            } catch (err) {
                errors.push({ merchant: merchantObj.merchant, error: err.message });
            }
        }));

        if (errors.length > 0) {
            return res.status(207).json({
                message: "Some merchants failed to add",
                added: successMerchants,
                errors
            });
        }

        return res.status(200).json({
            message: "All merchants added successfully",
            added: successMerchants
        });

    } catch (error) {
        return res.status(500).json({ message: "Failed to add merchants", error: error.message });
    }
};







export default { addOrganization, getOrganization, colleagueRequest, getOrganizationRequest, addMerchant };
