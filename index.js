import express from 'express';

const app = express();

// 欢迎页
app.get('/', (req, res) => {
  res.send('实时汇率API已上线（免费测试版）！访问 /rate?from=USD&to=CNY 获取数据。后期加x402支付墙赚USDC~');
});

// 核心端点：/rate?from=USD&to=CNY
app.get('/rate', async (req, res) => {
  const { from = 'USD', to = 'EUR' } = req.query;
  if (!from || !to) {
    return res.status(400).json({ error: '请提供 from 和 to 参数' });
  }
  try {
    const response = await fetch(`https://api.frankfurter.app/latest?from=${from}&to=${to}`);
    const data = await response.json();
    if (!data.rates || !data.rates[to]) {
      return res.status(400).json({ error: '不支持的货币对' });
    }
    res.json({
      from,
      to,
      rate: data.rates[to],
      date: data.date,
      message: '免费提供，欢迎AI代理调用！'
    });
  } catch (error) {
    res.status(500).json({ error: '获取汇率失败，请重试' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`API运行在端口 ${port}`);
});
