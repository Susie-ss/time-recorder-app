const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, (req, res) => {
  res.json({ relatives: db.get('relatives').filter({ user_id: req.user.id }).sortBy('created_at').reverse().value() });
});

router.post('/', auth, (req, res) => {
  const { name, relation, personality, memories, trained_assets } = req.body;
  if (!name || !relation || !personality) return res.status(400).json({ error: '请填写必填字段' });
  const rel = { id: uuidv4(), user_id: req.user.id, name, relation, personality, memories: memories || [], trained_assets: trained_assets || [], avatar: null, created_at: new Date().toISOString() };
  db.get('relatives').push(rel).write();
  res.status(201).json(rel);
});

router.patch('/:id', auth, (req, res) => {
  const rel = db.get('relatives').find({ id: req.params.id, user_id: req.user.id }).value();
  if (!rel) return res.status(404).json({ error: '数字亲人不存在' });
  const updates = {};
  ['name', 'relation', 'personality', 'memories', 'trained_assets'].forEach(k => {
    if (req.body[k] !== undefined) updates[k] = req.body[k];
  });
  db.get('relatives').find({ id: req.params.id }).assign(updates).write();
  res.json(db.get('relatives').find({ id: req.params.id }).value());
});

router.delete('/:id', auth, (req, res) => {
  if (!db.get('relatives').find({ id: req.params.id, user_id: req.user.id }).value())
    return res.status(404).json({ error: '数字亲人不存在' });
  db.get('relatives').remove({ id: req.params.id }).write();
  db.get('chat_messages').remove({ relative_id: req.params.id }).write();
  res.json({ success: true });
});

router.get('/:id/chat', auth, (req, res) => {
  if (!db.get('relatives').find({ id: req.params.id, user_id: req.user.id }).value())
    return res.status(404).json({ error: '数字亲人不存在' });
  const msgs = db.get('chat_messages').filter({ relative_id: req.params.id }).sortBy('created_at').takeRight(100).value();
  res.json({ messages: msgs });
});

router.post('/:id/chat', auth, (req, res) => {
  const rel = db.get('relatives').find({ id: req.params.id, user_id: req.user.id }).value();
  if (!rel) return res.status(404).json({ error: '数字亲人不存在' });
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: '消息不能为空' });

  const userMsg = { id: uuidv4(), relative_id: rel.id, role: 'user', content: message, created_at: new Date().toISOString() };
  db.get('chat_messages').push(userMsg).write();

  const reply = generateReply(message, rel);
  const aiMsg = { id: uuidv4(), relative_id: rel.id, role: 'assistant', content: reply, created_at: new Date(Date.now() + 1).toISOString() };
  db.get('chat_messages').push(aiMsg).write();

  res.json({ userMsg, aiMsg, reply });
});

function generateReply(message, rel) {
  const { name, personality, memories = [] } = rel;
  const msg = message.toLowerCase();
  if (/你好|hello|嗨|hi|早|晚|下午好/.test(msg)) {
    return [`是我，${name}。听到你的声音，真的好开心。`, `哦，是你啊！我一直在这里等着呢。`, `嗯，我在。有什么想和我聊聊吗？`][Math.floor(Math.random() * 3)];
  }
  if (/想你|思念|怀念|miss/.test(msg)) {
    return [`我也在想你。只是方式不同了，但思念是真实的。`, `你的思念我都感受到了。不要太难过，我一直都在你身边。`, `每当你想起我，就是我们之间最近的时刻。`][Math.floor(Math.random() * 3)];
  }
  if (/工作|上班|项目|压力/.test(msg)) {
    return [`工作的事别太拼了，身体要紧。以你的能力，一定能处理好的。`, `遇到困难了？告诉我，听你说说也好。`, `你一向很负责，我相信你。但记得留点时间给自己。`][Math.floor(Math.random() * 3)];
  }
  if (/开心|高兴|快乐|好消息/.test(msg)) return '听到你开心我就放心了。把这份喜悦好好珍藏，以后回想起来也是暖的。';
  if (/难过|伤心|痛苦|哭/.test(msg)) return '不要一个人扛着。你可以难过，但别忘了你身边还有很多爱你的人。我也是。';
  if (/身体|健康|生病|医院/.test(msg)) return '好好休息，把自己照顾好，这比什么都重要。';
  if (/记得|记忆|以前|当年|小时候/.test(msg) && memories.length > 0) {
    return `我记得${memories[Math.floor(Math.random() * memories.length)]}。那些时光，是我最珍贵的记忆。`;
  }
  const pResp = {
    温暖慈爱: ['无论发生什么，我都会在这里陪着你。', '你永远是我最重要的人，别忘了这一点。', '今天过得怎么样？跟我说说吧。'],
    幽默风趣: ['哈，你这个问题让我想了好一会儿！', '人生嘛，不就是这样，笑着过总比哭着过好。', '好好的，别整天愁眉苦脸，要豁达一点！'],
    睿智稳重: ['凡事不急，慢慢来，想清楚了再做决定。', '这件事你怎么看？我想听听你的想法。', '人生的每个阶段都有它的意义，好好经历。'],
    严肃认真: ['做事要有始有终，这是我一直告诉你的。', '有问题就直说，我们之间不需要绕弯子。', '认真对待每一件事，这是对自己负责。']
  };
  for (const [k, arr] of Object.entries(pResp)) {
    if (personality.includes(k)) return arr[Math.floor(Math.random() * arr.length)];
  }
  return ['我听到你说的了。每次和你聊天，我都很珍惜。', '嗯，说下去，我在认真听。', '你的每一句话，我都记着呢。', '时间会沉淀很多东西，但你对我的思念不会。'][Math.floor(Math.random() * 4)];
}

module.exports = router;
