import React, {Component} from 'react'
import axios from 'axios'
import {Redirect} from 'react-router-dom'
import {Button, Container, Divider, Form, Header, Modal, Table} from "semantic-ui-react";

let moment = require('moment');

class HomeForm extends Component {
  
  defaultState = {
    username: '',
    todos: [],
    error: null,
    modalOpen: false,
    modalData: null,
    modalID: null
  };
  
  constructor(props) {
    super(props);
    this.state = {...this.defaultState}
    this.handleAdd = this.handleAdd.bind(this)
    this.handleUpdate = this.handleUpdate.bind(this)
  }
  
  handleOpen = (data, id) => this.setState({modalOpen: true, modalData: data, modalID: id})
  
  handleClose = () => this.setState({modalOpen: false, modalData: null, modalID: null})
  
  componentWillReceiveProps(nextProps) {
    if (nextProps.user) {
      const newState = {...this.state};
      newState.username = nextProps.user.username
      this.setState(newState, this.getTodos())
    } else {
      this.setState(this.defaultState)
    }
  }
  
  handleAdd = () => {
    const task = {username: this.state.username, value: this.refs.descrInput.value}
    if (task.value && task.value.length > 0) {
      axios.post('/todo', task)
      .then(res => {
        if (res.data) {
          this.refs.descrInput.value = ''
          this.getTodos();
        }
      })
      .catch(err => console.log(err))
    }
  }
  
  handleDelete = (id) => {
    axios.delete(`/todo/${id}`)
    .then(res => {
      if (res.data) {
        this.getTodos()
      }
    })
    .catch(err => console.log(err))
  }
  
  handleUpdate = () => {
    const {modalID, modalData} = this.state
    const task = {value: this.refs.updateDescrInput.value}
    if (task.value && task.value.length > 0 && task.value !== modalData) {
      axios.put(`/todo/${modalID}`, task)
      .then(res => {
        if (res.data) {
          this.refs.updateDescrInput.value = ''
          this.handleClose()
          this.getTodos();
        }
      })
      .catch(err => console.log(err))
    }
  }
  
  getTodos = () => {
    axios.get('/todo')
    .then(res => {
      if (res.data) {
        const newState = {...this.state};
        newState.todos = res.data
        this.setState(newState)
      }
    })
    .catch(err => {
      const newState = {...this.state};
      newState.todos = []
      newState.error = err
      this.setState(newState)
    })
  }
  
  displayListTODOs = (todos, username) =>
    todos.map((el, i) => (
      <Table.Row key={`${el._id}`}>
        <Table.Cell>{el.value}</Table.Cell>
        <Table.Cell>{moment(el.created).format("DD-MM-YYYY HH:mm")}</Table.Cell>
        <Table.Cell>{moment(el.updated).format("DD-MM-YYYY HH:mm")}</Table.Cell>
        <Table.Cell>{el.username}</Table.Cell>
        <Table.Cell collapsing>
          <Button
            basic={true}
            color={'blue'}
            content={'Edit'}
            icon={'pencil'}
            disabled={username !== el.username}
            onClick={() => this.handleOpen(el.value, el._id)}
          />
        </Table.Cell>
        <Table.Cell collapsing>
          <Button
            basic={true}
            color={'red'}
            content={'Delete'}
            icon={'trash'}
            onClick={() => this.handleDelete(el._id)}
            disabled={username !== el.username}
          />
        </Table.Cell>
      </Table.Row>
    ));
  
  render() {
    const {todos, username, error} = this.state
    if (this.state.redirectTo) {
      return <Redirect to={{pathname: this.state.redirectTo}}/>
    }
    if (error) return (<div>
      <h3>ERROR HAPPENED</h3>
      <h5>{error}</h5>
    </div>)
    if (!username) {
      return (
        <div className="CustomForm">
          <Container text>
            <h1>Please, Log In</h1>
            <div style={{textAlign:"justify"}}>
              <p>Welcome to the all-in-one Todo app, where organization meets simplicity, designed to make your life easier and more productive from the moment you open it!</p>

<p>As you step into the virtual gateway of productivity, you're greeted by a clean, minimalist home page that serves as your command center for all tasks and to-dos. The interface is sleek and intuitive, inviting you to effortlessly dive into your day's activities.</p>

<p>At the heart of the home page lies a customizable task list, your digital canvas for capturing all your responsibilities, aspirations, and errands. Each task is displayed with clarity, offering a glimpse into what awaits you in the day ahead. The design is streamlined yet versatile, catering to both the meticulous planner and the spontaneous doer.</p>

<p>The background exudes a sense of tranquility, adorned with soft hues or dynamic patterns, depending on your preference. It's not just an app; it's a serene sanctuary where you can declutter your mind and focus on what truly matters.</p>

<p>
In essence, our home page is not merely a tool; it's a gateway to a more organized, efficient, and fulfilling life. With its user-centric design and array of features, it empowers you to seize the day and transform your aspirations into achievements, one task at a time. Welcome to the future of productivity—welcome to our Todo app home page.</p>
            </div>
          </Container>
        </div>
      )
    }
    return (
      <div className="CustomForm">
        <Container text>
          <h1>TODOs</h1>
          <Table celled>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Description</Table.HeaderCell>
                <Table.HeaderCell>Created</Table.HeaderCell>
                <Table.HeaderCell>Updated</Table.HeaderCell>
                <Table.HeaderCell>Username</Table.HeaderCell>
                <Table.HeaderCell/>
                <Table.HeaderCell/>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {this.displayListTODOs(todos, username)}
            </Table.Body>
          </Table>
          <Divider horizontal>Add new TODO</Divider>
          <Form>
            <Form.Field>
              <label htmlFor="description">TODO: </label>
              <input
                type="text"
                ref="descrInput"
              />
            </Form.Field>
            <Button
              basic={true}
              color={'green'}
              onClick={this.handleAdd}
              content={'Add'}
              icon={'plus'}
            />
          </Form>
        </Container>
        <Modal open={this.state.modalOpen} closeIcon onClose={this.handleClose} size={"small"}>
          <Header icon='browser' content="New description"/>
          <Modal.Content>
            <Form>
              <Form.Field>
                <label htmlFor="description">TODO: </label>
                <input
                  defaultValue={this.state.modalData}
                  type="text"
                  ref="updateDescrInput"
                />
              </Form.Field>
              <Button
                basic={true}
                color={'blue'}
                content={'Edit'}
                icon={'pencil'}
                onClick={this.handleUpdate}
              />
            </Form>
          </Modal.Content>
        </Modal>
      </div>
    )
  }
}

export default HomeForm
