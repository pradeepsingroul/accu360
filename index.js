
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // Ensure fetch is imported or installed

const app = express();
const port = 3232;
app.use(cors());

async function getTotalRecords(doctype, filters) {
    // This API call fetches just the count of the filtered records
    let url = `https://planetpharma.accu360.cloud/api/resource/${doctype}?fields=["name"]&filters=${filters}&limit_page_length=*`;
    console.log('Fetching total records URL:', url);

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
            return data.data.length; // Return the total count based on filters
        } else {
            console.error('Error fetching total records:', data);
            return 0;
        }
    } catch (error) {
        console.error('Error fetching total records:', error.message);
        return 0;
    }
}

async function getInvoices(doctype, fields, start, limit, filters) {
    let url = `https://planetpharma.accu360.cloud/api/resource/${doctype}`;
    url += `?fields=${fields}&limit_start=${start}&limit_page_length=${limit}&filters=${filters}`;

    console.log('Fetching invoices URL:', url);
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
            // Fetch detailed data in parallel for each record
            const detailedData = await getDataParallel(doctype,data.data);
            return { success: true, data: detailedData };
        } else {
            return { success: false, error: data };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Fetch detailed data for each invoice in parallel
async function getDataParallel(doctype,data) {
    const promises = data.map(item => {
        const name = item.name;
        const url = `https://planetpharma.accu360.cloud/api/resource/${doctype}/${name}`;

        return fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `token 2ed5ebc5ece4903:041dee4e4e8c120`
            }
        })
        .then(response => response.json())
        .then(dt => dt.data)
        .catch(error => {
            console.error('Fetch error:', error.message);
            return null;
        });
    });

    const detailedResponses = await Promise.all(promises);
    return detailedResponses.filter(response => response !== null);
}

// Route to get invoices based on pagination
app.get('/get-invoices', async (req, res) => {
    const { doctype = 'Sales Invoice', fields = '["*"]', page = 1, length = 100, filters = '[]' } = req.query;

    const parsedFilters = JSON.parse(filters);
    const parsedFields = JSON.stringify(JSON.parse(fields));

    console.log(`Doctype: ${doctype}, Fields: ${fields}, Page: ${page}, Page Length: ${length}, Filters: ${filters}`);

    // Fetch total number of records matching the filters
    const totalRecords = await getTotalRecords(doctype, filters);
    console.log('totalRecords', totalRecords);

    if (totalRecords === 0) {
        return res.status(200).json({ success: true, totalRecords, totalPages: 0, page: parseInt(page), data: [] });
    }

    // Calculate pagination details
    const totalPages = Math.ceil(totalRecords / length);
    const start = (page - 1) * length;

    // Fetch the paginated records
    const listResult = await getInvoices(doctype, parsedFields, start, length, filters);

    if (listResult.success) {
        const currentPageLength = listResult.data.length; 
        res.status(200).json({
            success: true,
            totalRecords,
            totalPages,
            page: parseInt(page),
            pageLength: parseInt(length),
            currentPageLength,
            data: listResult.data
        });
    } else {
        res.status(401).json({ success: false, error: listResult.error });
    }
});
app.get('/get-chart-of-accounts', async (req, res) => {
    const { doctype = 'Account', fields = '["*"]', page = 1, length = "*", filters = '[]' } = req.query;

    const parsedFilters = JSON.parse(filters);
    const parsedFields = JSON.stringify(JSON.parse(fields));

    console.log(`Doctype: ${doctype}, Fields: ${fields}, Page: ${page}, Page Length: ${length}, Filters: ${filters}`);

    // Fetch total number of records matching the filters
    const totalRecords = await getTotalRecords(doctype, filters);
    console.log('totalRecords', totalRecords);

    if (totalRecords === 0) {
        return res.status(200).json({ success: true, totalRecords, totalPages: 0, page: parseInt(page), data: [] });
    }

    // Calculate pagination details
    const totalPages = Math.ceil(totalRecords / length);
    const start = (page - 1) * length;

    // Fetch the paginated records
    const listResult = await getInvoices(doctype, parsedFields, start, length, filters);

    if (listResult.success) {
        const currentPageLength = listResult.data.length; 
        res.status(200).json({
            success: true,
            totalRecords,
            totalPages,
            page: parseInt(page),
            pageLength: parseInt(length),
            currentPageLength,
            data: listResult.data
        });
    } else {
        res.status(401).json({ success: false, error: listResult.error });
    }
});

app.get('/get-purchase', async (req, res) => {
    const { doctype = 'Purchase Invoice', fields = '["*"]', page = 1, length = 100, filters = '[]' } = req.query;

    const parsedFilters = JSON.parse(filters);
    const parsedFields = JSON.stringify(JSON.parse(fields));

    console.log(`Doctype: ${doctype}, Fields: ${fields}, Page: ${page}, Page Length: ${length}, Filters: ${filters}`);

    // Fetch total number of records matching the filters
    const totalRecords = await getTotalRecords(doctype, filters);
    console.log('totalRecords', totalRecords);

    if (totalRecords === 0) {
        return res.status(200).json({ success: true, totalRecords, totalPages: 0, page: parseInt(page), data: [] });
    }

    // Calculate pagination details
    const totalPages = Math.ceil(totalRecords / length);
    const start = (page - 1) * length;

    // Fetch the paginated records
    const listResult = await getInvoices(doctype, parsedFields, start, length, filters);

    if (listResult.success) {
        const currentPageLength = listResult.data.length; 
        res.status(200).json({
            success: true,
            totalRecords,
            totalPages,
            page: parseInt(page),
            pageLength: parseInt(length),
            currentPageLength,
            data: listResult.data
        });
    } else {
        res.status(401).json({ success: false, error: listResult.error });
    }
});

app.get('/get-payment', async (req, res) => {
    const { doctype = 'Payment Entry', fields = '["*"]', page = 1, length = 100, filters = '[]' } = req.query;

    const parsedFilters = JSON.parse(filters);
    const parsedFields = JSON.stringify(JSON.parse(fields));

    console.log(`Doctype: ${doctype}, Fields: ${fields}, Page: ${page}, Page Length: ${length}, Filters: ${filters}`);

    // Fetch total number of records matching the filters
    const totalRecords = await getTotalRecords(doctype, filters);
    console.log('totalRecords', totalRecords);

    if (totalRecords === 0) {
        return res.status(200).json({ success: true, totalRecords, totalPages: 0, page: parseInt(page), data: [] });
    }

    // Calculate pagination details
    const totalPages = Math.ceil(totalRecords / length);
    const start = (page - 1) * length;

    // Fetch the paginated records
    const listResult = await getInvoices(doctype, parsedFields, start, length, filters);

    if (listResult.success) {
        const currentPageLength = listResult.data.length; 
        res.status(200).json({
            success: true,
            totalRecords,
            totalPages,
            page: parseInt(page),
            pageLength: parseInt(length),
            currentPageLength,
            data: listResult.data
        });
    } else {
        res.status(401).json({ success: false, error: listResult.error });
    }
});

app.get('/get-journal', async (req, res) => {
    const { doctype = 'Journal Entry', fields = '["*"]', page = 1, length = 100, filters = '[]' } = req.query;

    const parsedFilters = JSON.parse(filters);
    const parsedFields = JSON.stringify(JSON.parse(fields));

    console.log(`Doctype: ${doctype}, Fields: ${fields}, Page: ${page}, Page Length: ${length}, Filters: ${filters}`);

    // Fetch total number of records matching the filters
    const totalRecords = await getTotalRecords(doctype, filters);
    console.log('totalRecords', totalRecords);

    if (totalRecords === 0) {
        return res.status(200).json({ success: true, totalRecords, totalPages: 0, page: parseInt(page), data: [] });
    }

    // Calculate pagination details
    const totalPages = Math.ceil(totalRecords / length);
    const start = (page - 1) * length;

    // Fetch the paginated records
    const listResult = await getInvoices(doctype, parsedFields, start, length, filters);

    if (listResult.success) {
        const currentPageLength = listResult.data.length; 
        res.status(200).json({
            success: true,
            totalRecords,
            totalPages,
            page: parseInt(page),
            pageLength: parseInt(length),
            currentPageLength,
            data: listResult.data
        });
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