import express from 'express';

const app = express();

// 欢迎页
app.get('/', (req, res) => {
  res.send(`
    <h1>实时汇率查询API（免费版）</h1>
    <p>支持全球30+种货币实时汇率查询，包括：</p>
    <ul>
      <li>USD（美元）</li>
      <li>CNY（人民币）</li>
      <li>EUR（欧元）</li>
      <li>JPY（日元）</li>
      <li>GBP（英镑）</li>
      <li>HKD（港币）</li>
      <li>KRW（韩元）</li>
      <li>AUD（澳元）</li>
      <li>CAD（加元）</li>
      <li>更多...</li>
    </ul>
    <p><strong>使用方法：</strong></p>
    <p>访问：https://x402-exchange-rate-api.vercel.app/rate?from=USD&to=CNY</p>
    <p>示例：</p>
    <ul>
      <li><a href="/rate?from=USD&to=CNY">美元 → 人民币</a></li>
      <li><a href="/rate?from=USD&to=JPY">美元 → 日元</a></li>
      <li><a href="/rate?from=EUR&to=CNY">欧元 → 人民币</a></li>
      <li><a href="/rate?from=USD&to=HKD">美元 → 港币</a></li>
    </ul>
    <p>欢迎AI代理和开发者高频调用！后期升级x402付费版</p>
  `);
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
