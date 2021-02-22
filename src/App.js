import React, { useState, useEffect } from 'react';
import './App.css';
import { API } from 'aws-amplify';
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
import { listTodos } from './graphql/queries';
import { createTodo as createTodoMutation, deleteTodo as deleteTodoMutation } from './graphql/mutations';
import { DataStore } from '@aws-amplify/datastore';
import { Todo } from './models';

const initialFormState = { name: '', description: '' }

function App() {
  const [todos, setTodos] = useState([]);
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchTodos();
  }, []);

  async function fetchTodos() {
    // const apiData = await API.graphql({ query: listTodos });
    // setTodos(apiData.data.listTodos.items);

    const toDos = await DataStore.query(Todo)
    console.log("fetch todos result", toDos)
    setTodos(toDos);
  }

  async function createTodo() {
    if (!formData.name || !formData.description) return;
    // await API.graphql({ query: createTodoMutation, variables: { input: formData } });
    await DataStore.save(new Todo({...formData}))
    setTodos([ ...todos, formData ]);
    setFormData(initialFormState);
  }

  async function deleteTodo( todo ) {
    const newTodosArray = todos.filter(note => note.id !== todo.id);
    setTodos(newTodosArray);
    await DataStore.delete(Todo, item => item.id("eq", todo.id ))
    // await API.graphql({ query: deleteTodoMutation, variables: { input: { id } }}).catch(err => {
    //   console.error("deleteTodo error: ", err);
    // });

  }

  return (
    <div className="App">
      <h1>My Todo App</h1>
      <input
        onChange={e => setFormData({ ...formData, 'name': e.target.value})}
        placeholder="Todo name"
        value={formData.name}
      />
      <input
        onChange={e => setFormData({ ...formData, 'description': e.target.value})}
        placeholder="Todo description"
        value={formData.description}
      />
      <button onClick={createTodo}>Create Todo</button>
      <div style={{marginBottom: 30}}>
        {
          todos.map(todo => (
            <div key={todo.id || todo.name}>
              <h2>{todo.name}</h2>
              <p>{todo.description}</p>
              <button onClick={() => deleteTodo(todo)}>Delete Todo</button>
            </div>
          ))
        }
      </div>
      <AmplifySignOut />
    </div>
  );
}

export default withAuthenticator(App);