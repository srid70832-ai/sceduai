import app from '../server.ts';

app.use((err: any, req: any, res: any, next: any) => {
  res.status(500).json({ success: false, error: { message: err.message, stack: err.stack } });
});

export default app;
