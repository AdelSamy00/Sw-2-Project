const router = require('express').Router();
const Admin = require('../repository/Admin');
const AdminServices = require('../services/AdminServices');

const admin = new Admin();
const services = new AdminServices(admin);
router.get('/get-all-users', async function (req, res) {
  const AllUser = await services.getAllUsers();
  if (AllUser.length == 0) {
    res.status(404).json('there not found any users.');
  } else {
    res.status(200).json(AllUser);
  }
});

router.get('/get-new-users', async (req, res) => {
  const allNewUsers = await services.getNewUsers();
  if (allNewUsers.length == 0) {
    res.status(404).json({
      message: 'ther are no new users waiting for approval.',
    });
  } else {
    res
      .status(200)
      .json({ message: 'get all users successfully.', allData: allNewUsers });
  }
});

router.put('/get-new-users/:userID&:reqLimit', async (req, res) => {
  const { userID, reqLimit } = req.params;
  services.approveUser(userID, reqLimit, res);
  if (res.status === 500) {
    res.json({ message: 'samething Wrong.' });
  } else {
    res.json({ message: 'Approveal completed ' });
  }
});

router.get('/all-borrowed-request', async (req, res) => {
  const allRequest = await services.getAllBorrowedRequest();
  if (allRequest.length == 0) {
    res
      .status(200)
      .json({ message: 'there not found any requests.', data: allRequest });
  } else {
    res
      .status(200)
      .json({ message: 'there found some requests', data: allRequest });
  }
});
router.put(
  '/all-borrowed-requests/:id&:ISBN&:startDate&:endDate',
  async (req, res) => {
    const { id, ISBN, startDate, endDate } = req.params;
    let userLimits = await admin.getUserLimitsByID(id);
    userLimits = userLimits.limited_requests;
    if (userLimits > 0) {
      await services.approveBorrowedRequest(id, ISBN, startDate, endDate, res);
      if (res.status === 500) {
        res.json({ message: 'samething Wrong.' });
      } else if (res.status === 405) {
        res.json({ message: 'samething Wrong.' });
      } else {
        userLimits = userLimits - 1;
        await services.updateUserLimits(id, userLimits);
        await services.updateDateInHistory(id, ISBN, startDate, endDate);
        await services.updateStatusInHistory(id, ISBN, 'aproval');
        res.json({ message: 'Approveal completed ' });
      }
    } else {
      res.status(405).json({ message: 'Not Allowed' });
    }
  }
);

router.delete('/reject-borrowed-request/:id&:ISBN', async (req, res) => {
  const { id, ISBN } = req.params;
  const rejected = await services.rejectBorrowedRequest(id, ISBN);
  if (rejected.affectedRows == 1) {
    res.status(202).json({ message: 'delete successfuly', data: rejected });
    await services.updateStatusInHistory(id, ISBN, 'rejected');
  } else {
    res.status(400).json({ message: 'bad request' });
  }
});

router.delete('/delete-book/:ISBN', async (req, res) => {
  const { ISBN } = req.params;
  //console.log(ISBN);
  const deletedBook = await admin.deleteBookByISBN(ISBN);
  if (deletedBook.affectedRows == 1) {
    res.status(202).json({ message: 'delete successfuly', data: deletedBook });
  } else {
    res.status(400).json({ message: 'bad request' });
  }
});

router.put(
  '/update-book/:ISBN&:title&:description&:author&:rackNumber&:subject',
  async (req, res) => {
    try {
      const { ISBN, title, description, author, rackNumber, subject } =
        req.params;
      const data = {
        ISBN: ISBN,
        title: title,
        description: description,
        author: author,
        rackNumber: rackNumber,
        subject: subject,
      };
      const updatedBook = await services.updateBook(data, res);
      if (updatedBook.affectedRows == 1) {
        res.json({ message: 'update successfully', data: updatedBook });
      } else {
        res.json({ message: 'bad request' });
      }
    } catch (error) {
      throw error;
    }
  }
);

router.delete('/reject-user/:id', async (req, res) => {
  const { id } = req.params;
  const rejectedUser = await services.rejectUser(id);
  if (rejectedUser.affectedRows == 1) {
    res.status(202).json({ message: 'delete successfuly', data: rejectedUser });
  } else {
    res.status(400).json({ message: 'bad request' });
  }
});

module.exports = router;
