const express = require('express');
const db = require('./models')


const app = express();

app.use(express.json());

app.get('/users', async (req, res) => {
  try {
    // Fetch users and their associated jobs
    const users = await db.User.findAll({
      include: [
        {
          model: db.Job,
          as: 'jobs',
          include: {
            model: db.Execution,
            as: "executions"
          }
        },
      ],
    });


    // Send the response
    res.json(users);
  } catch (error) {
    console.error('Error fetching schedule:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

require('./routes/auth.routes')(app);
require('./routes/user.routes')(app);
require('./routes/job.routes')(app);



// Start the server
const port = process.env.API_PORT;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
