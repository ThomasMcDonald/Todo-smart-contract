const TodoList = artifacts.require('TodoList');


contract("TodoList", (accounts) => {
	let [alice, bob] = accounts; 
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
		assert.equal(result.logs[0].args._name, testTask.name);
	});

	it('Should set task complete', async() => {
		const createResult = await todoInstance.createTask(testTask.name, testTask.description, {from: alice});
		const actionResult = await todoInstance.actionTask(createResult.logs[0].args._taskId, true);
		assert.equal(actionResult.receipt.status, true);
		assert.equal(actionResult.logs[0].args._taskId.toNumber(), createResult.logs[0].args._taskId.toNumber());
		assert.equal(actionResult.logs[0].args._isComplete, true);
	});


	it('Should set task incomplete', async() => {
		const createResult = await todoInstance.createTask(testTask.name, testTask.description, {from: alice});
		const actionResult = await todoInstance.actionTask(createResult.logs[0].args._taskId, false);
		assert.equal(actionResult.receipt.status, true);
		assert.equal(actionResult.logs[0].args._taskId.toNumber(), createResult.logs[0].args._taskId.toNumber());
		assert.equal(actionResult.logs[0].args._isComplete, false);
	});


	it('Should get all tasks for owner', async() => {
		const result = await todoInstance.createTask(testTask.name, testTask.description, {from: alice});
		const allTasksForOwner = await todoInstance.getTasksByOwner(alice, {from: alice});
		assert.isAbove(allTasksForOwner.length, 0);
	});

});