const express = require('express');
const cors = require('cors'); 

const app = express();
const port = 3232;
app.use(cors());

async function getInvoices(doctype, fields, start, limit, filters = []) {
    let url = 'https://planetpharma.accu360.cloud/api/resource/Sales Invoice';
    url += `?fields=${JSON.stringify(fields)}&limit_start=${start}&limit_page_length=${limit}`;

    if (filters.length > 0) {
        url += `&filters=${encodeURIComponent(JSON.stringify(filters))}`;
    }

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `token 2ed5ebc5ece4903:041dee4e4e8c120`
            }
        });

        const data = await response.json();
        if (response.ok) {
            const detailedData = await getData(data.data); // Pass data.data to getData function
            return { success: true, data: detailedData };
        } else {
            return { success: false, error: data };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function getData(data) {
    let detailedResponses = [];

    for (let key of data) { // Iterate over array of invoices
        let url = `https://planetpharma.accu360.cloud/api/resource/Sales Invoice/${key.name}`; // Assuming `name` exists

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `token 2ed5ebc5ece4903:041dee4e4e8c120`
                }
            });

            const dt = await response.json();
            if (response.ok) {
                detailedResponses.push(dt.data); 
            } else {
                console.error('Error fetching detailed invoice:', dt);
            }
        } catch (error) {
            console.error('Fetch error:', error.message);
        }
    }

    return detailedResponses; // Return the array of detailed responses
}

app.get('/get-invoices', async (req, res) => {
    const { doctype = 'Sales Invoice', fields = '["*"]', start = 0, length = 10, filters = '[]' } = req.query;

    console.log(`Doctype: ${doctype}, Fields: ${fields}, Start: ${start}, Length: ${length}, Filters: ${filters}`);

    let parsedFilters;
    let parsedFields;

    try {
        parsedFilters = JSON.parse(filters);
    } catch (e) {
        parsedFilters = [];
    }

    try {
        parsedFields = JSON.parse(fields);
    } catch (e) {
        parsedFields = ['*'];
    }

    const listResult = await getInvoices(doctype, parsedFields, start, length, parsedFilters);

    if (listResult.success) {
        res.status(200).json({ success: true, data: listResult.data });
    } else {
        res.status(401).json({ success: false, error: listResult.error });
    }
});

// Home route
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome to the API. Please use the /get-invoices endpoint for the desired functionality.",
        data: ""
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
