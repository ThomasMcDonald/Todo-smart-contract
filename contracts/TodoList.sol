pragma solidity >=0.5.0;

contract TodoList {
	struct Task {
		string name;
		string description;
		bool isComplete;
	}


	event newTask(uint _taskId, string _name, string _description);
	event taskActioned(uint _taskId, bool _isComplete);
	modifier isTaskOwner(uint _taskId){
		require(msg.sender == taskToOwner[_taskId]); // make sure that the task is owned by sender
		_;	
	}

	Task[] public taskList; 
	mapping (uint => address) public taskToOwner;
	mapping (address => uint) public ownerTaskCount;

	function createTask(string calldata _name, string calldata _description) external {
		taskList.push(Task(_name, _description, false));
		uint taskId = taskList.length - 1;
		taskToOwner[taskId] = msg.sender;
		ownerTaskCount[msg.sender] = ownerTaskCount[msg.sender] + 1; // TODO fix this so it wont overflow SafeMath or new solidity version that works like this by default
		emit newTask(taskId, _name, _description);
	}


	function actionTask(uint _taskId, bool _isComplete) external isTaskOwner(_taskId) {
		taskList[_taskId].isComplete = _isComplete;
		emit taskActioned(_taskId, _isComplete);
	}


	function getTasksByOwner(address _owner) external view returns(uint[] memory){
		uint[] memory taskResults = new uint[](ownerTaskCount[_owner]);
		uint counter = 0;

		for(uint i = 0; i < taskList.length; i += 1){
			if(taskToOwner[i] == _owner){
				taskResults[counter] = i;
				counter++;
			}
		}

		return taskResults;
	}



}