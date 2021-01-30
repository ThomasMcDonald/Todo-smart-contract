const TodoList = artifacts.require('TodoList');


contract("TodoList", (accounts) => {
	let [alice] = accounts; 
	const testTask = {
		name: 'Test Task',
		description: 'This is a test taskl'
	};

	let todoInstance;
	beforeEach( async () => {
		todoInstance = await TodoList.new();
	})

	it('Should create a new task', async() => {
		const result = await todoInstance.createTask(testTask.name, testTask.description, {from: alice});
		assert.equal(result.receipt.status, true);
		assert.equal(result.logs[0].args.name, testTask.name);
	});

	it('Should set task complete', async() => {
		const createResult = await todoInstance.createTask(testTask.name, testTask.description, {from: alice});
		const actionResult = await todoInstance.actionTask(createResult.logs[0].args.taskId, true);
		assert.equal(actionResult.receipt.status, true);
		assert.equal(actionResult.logs[0].args.taskId.toNumber(), createResult.logs[0].args.taskId.toNumber());
		assert.equal(actionResult.logs[0].args.isComplete, true);
	});


	it('Should set task incomplete', async() => {
		const createResult = await todoInstance.createTask(testTask.name, testTask.description, {from: alice});
		const actionResult = await todoInstance.actionTask(createResult.logs[0].args.taskId, false);
		assert.equal(actionResult.receipt.status, true);
		assert.equal(actionResult.logs[0].args.taskId.toNumber(), createResult.logs[0].args.taskId.toNumber());
		assert.equal(actionResult.logs[0].args.isComplete, false);
	});


	it('Should get all tasks for owner', async() => {
		await todoInstance.createTask(testTask.name, testTask.description, {from: alice});
		const allTasksForOwner = await todoInstance.getTasksByOwner(alice, {from: alice});
		assert.isAbove(allTasksForOwner.length, 0);
	});

});