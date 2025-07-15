const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Todo = require('../models/Todo');
const User = require('../models/User');

module.exports = (io) => {
    // @route   GET api/todos
    // @desc    Get all todos for a user (owned or shared)
    // @access  Private
    router.get('/', auth, async (req, res) => {
        try {
            const todos = await Todo.find({
                $or: [{ owner: req.user.id }, { sharedWith: req.user.id }],
            })
            .populate('owner', 'name email avatar')
            .populate('sharedWith', 'name email avatar')
            .sort({ createdAt: -1 }); // Sort by most recent

            res.json(todos);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    });

    // @route   POST api/todos
    // @desc    Create a new todo
    // @access  Private
    router.post('/', auth, async (req, res) => {
        const { title, description, status, dueDate, priority } = req.body;

        try {
            const newTodo = new Todo({
                title,
                description,
                status,
                dueDate,
                priority,
                owner: req.user.id,
            });

            let todo = await newTodo.save();
            todo = await todo.populate('owner', 'name email avatar');

            // Emit to the owner's room
            io.to(req.user.id).emit('new-todo', todo);

            res.json(todo);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    });

    // @route   PUT api/todos/:id
    // @desc    Update a todo
    // @access  Private
    router.put('/:id', auth, async (req, res) => {
        const { title, description, status, dueDate, priority } = req.body;

        const todoFields = {};
        if (title) todoFields.title = title;
        if (description) todoFields.description = description;
        if (status) todoFields.status = status;
        if (dueDate) todoFields.dueDate = dueDate;
        if (priority) todoFields.priority = priority;

        try {
            let todo = await Todo.findById(req.params.id);

            if (!todo) {
                return res.status(404).json({ msg: 'Todo not found' });
            }

            // Restrict edit: if sharedWith is not empty, only owner can edit
            const isOwner = todo.owner.toString() === req.user.id;
            if (todo.sharedWith.length > 0 && !isOwner) {
                return res.status(403).json({ msg: 'Only the owner can edit a shared task.' });
            }
            if (!isOwner && todo.sharedWith.length === 0 && !todo.sharedWith.map(id => id.toString()).includes(req.user.id)) {
                return res.status(401).json({ msg: 'User not authorized' });
            }

            todo = await Todo.findByIdAndUpdate(
                req.params.id,
                { $set: todoFields },
                { new: true }
            )
            .populate('owner', 'name email avatar')
            .populate('sharedWith', 'name email avatar');

            // Notify all collaborators and the owner
            io.to(todo.owner.toString()).emit('update-todo', todo);
            todo.sharedWith.forEach(user => {
                io.to(user._id.toString()).emit('update-todo', todo);
            });

            res.json(todo);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    });

    // @route   DELETE api/todos/:id
    // @desc    Delete a todo
    // @access  Private (Owner only)
    router.delete('/:id', auth, async (req, res) => {
        try {
            const todo = await Todo.findById(req.params.id);

            if (!todo) {
                return res.status(404).json({ msg: 'Todo not found' });
            }

            // Restrict delete: if sharedWith is not empty, only owner can delete
            const isOwner = todo.owner.toString() === req.user.id;
            if (todo.sharedWith.length > 0 && !isOwner) {
                return res.status(403).json({ msg: 'Only the owner can delete a shared task.' });
            }
            // Only owner or shared user can delete if not shared
            if (!isOwner && todo.sharedWith.length === 0 && !todo.sharedWith.map(id => id.toString()).includes(req.user.id)) {
                return res.status(401).json({ msg: 'User not authorized' });
            }
            const todoId = todo._id.toString();
            const ownerId = todo.owner.toString();
            const sharedWithIds = todo.sharedWith.map(id => id.toString());

            await Todo.deleteOne({ _id: todo._id });

            // Notify all collaborators and the owner
            io.to(ownerId).emit('delete-todo', todoId);
            sharedWithIds.forEach(userId => {
                io.to(userId).emit('delete-todo', todoId);
            });

            res.json({ msg: 'Todo removed' });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    });

    // @route   POST api/todos/:id/share
    // @desc    Share a todo with another user by email
    // @access  Private (Owner only)
    router.post('/:id/share', auth, async (req, res) => {
        const { email } = req.body;

        try {
            let todo = await Todo.findById(req.params.id);

            if (!todo) {
                return res.status(404).json({ msg: 'Todo not found' });
            }

            const isOwner = todo.owner.toString() === req.user.id;
            const isShared = todo.sharedWith.map(id => id.toString()).includes(req.user.id);
            if (!isOwner && !isShared) {
                return res.status(401).json({ msg: 'User not authorized' });
            }

            const userToShareWith = await User.findOne({ email });

            if (!userToShareWith) {
                return res.status(404).json({ msg: 'User with that email not found' });
            }
            
            if (userToShareWith.id === req.user.id) {
                return res.status(400).json({ msg: 'You cannot share a task with yourself' });
            }

            if (todo.sharedWith.map(id => id.toString()).includes(userToShareWith.id)) {
                return res.status(400).json({ msg: 'Task already shared with this user' });
            }

            todo.sharedWith.push(userToShareWith.id);
            await todo.save();

                       const populatedTodo = await Todo.findById(todo._id)
                .populate('owner', 'name email avatar')
                .populate('sharedWith', 'name email avatar');

            // Notify owner and all collaborators
            io.to(todo.owner.toString()).emit('update-todo', populatedTodo);
            todo.sharedWith.forEach(user => {
                io.to(user._id.toString()).emit('update-todo', populatedTodo);
            });
            
            // Also send a specific notification to the user it was shared with
            io.to(userToShareWith.id).emit('new-shared-todo', populatedTodo);

            res.json(populatedTodo);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    });

    return router;
};