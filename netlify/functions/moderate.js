const fetch = require('node-fetch');

exports.handler = async (event, context) => {
    // 只允许 POST 请求
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({
                error: 'Method not allowed',
                message: 'Only POST requests are supported'
            })
        };
    }

    try {
        const { text } = JSON.parse(event.body);

        if (!text) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    error: 'Bad request',
                    message: 'Text field is required'
                })
            };
        }

        const response = await fetch('https://api.openai.com/v1/moderations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({ input: text })
        });

        const data = await response.json();

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(data)
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Internal server error',
                message: error.message
            })
        };
    }
};