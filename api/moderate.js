const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

module.exports = async (req, res) => {
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // 处理预检请求
    if (req.method === 'OPTIONS') {
        return res.status(200).json({ status: 'ok' });
    }

    try {
        // 验证请求方法
        if (req.method !== 'POST') {
            return res.status(405).json({
                error: 'Method not allowed',
                message: 'Only POST requests are supported'
            });
        }

        // 验证请求体
        if (!req.body || !req.body.text) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'Text field is required'
            });
        }

        // 验证 API 密钥
        if (!process.env.OPENAI_API_KEY) {
            return res.status(500).json({
                error: 'Server configuration error',
                message: 'OpenAI API key is not configured'
            });
        }

        // 调用 OpenAI API
        const response = await fetch('https://api.openai.com/v1/moderations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                input: req.body.text
            })
        });

        // 检查 OpenAI 响应状态
        if (!response.ok) {
            const error = await response.json();
            console.error('OpenAI API Error:', error);
            return res.status(response.status).json({
                error: 'OpenAI API error',
                message: error.error?.message || 'Error calling OpenAI API',
                details: error
            });
        }

        // 解析并返回结果
        const data = await response.json();
        return res.status(200).json(data);

    } catch (error) {
        // 记录错误并返回友好的错误消息
        console.error('Server Error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: 'An unexpected error occurred',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};