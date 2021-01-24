import './App.css';
import Button from 'react-bootstrap/Button';
import Navbar from 'react-bootstrap/Navbar';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';

import Web3 from 'web3';
import React, { useState, useEffect } from 'react';
import { todoABI } from './config';

const todoContractAddress = process.env.REACT_APP_SMART_CONTRACT_ADDRESS;

function Header({children}){
  return <Navbar bg="dark" variant="dark">
  <Navbar.Brand href="#home">Todo Thing</Navbar.Brand>
  <Navbar.Brand >{children}</Navbar.Brand>
</Navbar>
}


function TaskFormModal(props) {
  return (
    <Modal
      show={props.show}
      onHide={props.onHide}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          {props.title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={props.onFormSubmit}>
          <Form.Group controlId="formBasicEmail">
            <Form.Label>Name</Form.Label>
            <Form.Control type="text"  autoComplete={'false'} name="name" onChange={props.formUpdate}/>
          </Form.Group>

          <Form.Group controlId="formBasicPassword">
            <Form.Label>Description</Form.Label>
            <Form.Control as="textarea" rows={3} name="description" onChange={props.formUpdate}/>
          </Form.Group>
          <Button onClick={props.onHide} variant="outline-secondary" >Cancel</Button>
          <Button variant="outline-primary" style={{float: 'right'}} type="submit">
            Submit
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

function Loading() {
  return <p style={{textAlign: 'center'}}>loading...</p>;
}

function TaskList({tasks, updateTask}) {
  return <ul>{tasks.map((task, index) => 
    <li key={index}>{task.name} - {task.description} 
    
      <input type='checkbox' defaultChecked={task.isComplete} onChange={(e) => updateTask(e, index)}></input>
    </li>)}
  </ul>        
  
}

function App() {
  const [user, setUser] = useState();
  const [tasks, setTasks] = useState([]);
  const [task, setTask] = useState({name: '', description:''});
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const web3 = new Web3(Web3.givenProvider || process.env.REACT_APP_BLOCKCHAIN_URL);

  const createTask = (e) => {
    e.preventDefault();
    const todoContract = new web3.eth.Contract(todoABI, todoContractAddress)

    todoContract.methods.createTask(task.name, task.description).send({from: user}).on('receipt', (receipt) => {
      console.log(receipt.events.newTask);

      setTasks(tasks.concat(receipt.events.newTask.returnValues))

      setTask({name: '', description:''})


      setIsModalOpen(false);
    });

  }
  
  const updateTask = (e, index) => {
    const isComplete = e.target.value;
    const todoContract = new web3.eth.Contract(todoABI, todoContractAddress);
    // todo only update task if actionTask was successfull
    todoContract.methods.actionTask(index, isComplete).send({from: user}).on('receipt', (receipt) => {
      console.log(receipt.events.taskActioned);
    });
  }


  const handleChange = e => {
    const { name, value } = e.target;
    setTask((prevState) => ({
        ...prevState,
        [name]: value
    }));
  };  


  const loadWeb3 = async() => {
    try{
      await web3.currentProvider.enable(); // should popup metmask
      const accounts = await web3.eth.getAccounts();
      setUser(accounts[0]);

    }catch(err){
      console.error(err);
    } 
  }

  const loadTasks = async () => {
    try{
      if(user){
        setLoading(true);
        const todoContract = new web3.eth.Contract(todoABI, todoContractAddress)
  
        const tasksByOwner = await todoContract.methods.getTasksByOwner(user).call();
        const newTasks = [];
  
        for(const index of tasksByOwner){
          const task = await todoContract.methods.taskList(index).call();
          newTasks.push(task);
        }
        setTasks(newTasks);
        setLoading(false);
      }
    }catch(err){
      console.error(err);
    }
    
  };


  useEffect(() => {
    loadTasks();
  }, [user]);


  return (
    <div className="App">

    <Header>
    {user ? 
    <div>
      <span>{user}</span> 
      <Button variant="outline-secondary" className="refreshTasks" onClick={() => loadTasks()}>Refresh Task List</Button>
      <Button variant="outline-primary" onClick={() => setIsModalOpen(true)}>Add new Task</Button>
    </div>  
    : <Button variant="primary" className="openWeb3" onClick={() => loadWeb3()}>Unlock</Button>}
    </Header>
      {user ? 
      <div>
          {loading ? <Loading/> : <TaskList tasks={tasks} updateTask={updateTask}/>}
            

      <TaskFormModal
        title="Create New Task"
        show={isModalOpen}
        onHide={() => setIsModalOpen(false)}
        onFormSubmit={createTask}
        formUpdate={handleChange}
      />
      </div>
        :
       <p>Nothing to see here...</p>
      }
  
    
    </div>
  );
}
export default App;
