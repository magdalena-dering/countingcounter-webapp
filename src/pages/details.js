import React from 'react';
import { Container, Row, Col } from 'react-grid-system';
import { withRouter } from 'react-router';
import { compose } from 'recompose';
import moment from 'moment/moment';

import * as routes from '../routes';

import withAuthorization from '../helpers/withAuthorization';
import { authCondition } from '../helpers/helpers';
import { db } from '../firebase';

import Field from '../components/Field';
import Button from '../components/Button';
import Checkbox from '../components/Checkbox';
import Textarea from '../components/Textarea';
import Modal from '../components/Modal';

class CounterDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      counter: '',
      format: "seconds",
      modal: false
    }
  }

  componentWillMount() {
    db.getCounters().then(snap => {
      const counters = [];

      snap.forEach(item => {
        let counter = item.val();
        counter.key = item.key;

        counters.push(counter)
      });
      console.log(counters);

      counters.forEach(counter => {
        console.log(counter.key);
        if (counter.key === this.props.match.params.id) {
          this.setState({counter: counter})
        }
      })
    })
  }

  changeFormat = (e) => {
    this.setState({format: e.target.value})
  };

  deleteCounter = () => {
    db.deleteCounter(this.state.counter.key);
    this.props.history.push(routes.DASHBOARD)
  };

  onOpen = () => {
    this.setState({modal: true})
  };

  onClose = () => {
    this.setState({modal: false})
  };

  render() {
    const now = moment();
    const counterTime = moment(this.state.counter.timestamp);
    const formatWeekday = "dddd";
    const formatDate = "Do MMMM YYYY";
    const formatTime = "HH:mm";

    const formats = ["seconds", "minutes", "hours", "days", "months", "years"];

    return (
      <Container>
        <Modal show={this.state.modal} close={this.onClose} className="column center">
          <p>Do you really want to delete this counter?</p>
          <div className="row" style={{width: '80%', marginTop: 30}}>
            <Button onClick={this.onClose}>No!</Button>
            <Button onClick={this.deleteCounter}>Yes!</Button>
          </div>
        </Modal>
        <Row>
          <Col xs={12}>
            <Field legend={this.state.counter.name ? this.state.counter.name : "Waiting for counter.."}
                   margin="10% 0 0 0" padding="50px 60px">
              <Row>
                <Col xs={6}>
                  <div className="counter-box">
                    <div className="half top">
                      <p className="bold">Counter set to:</p>
                      <div>
                        <p>{counterTime.format(formatWeekday)},</p>
                        <p>{counterTime.format(formatDate)}</p>
                        <p>{counterTime.format(formatTime)}</p>
                      </div>
                    </div>
                    {counterTime.isAfter(now) ?
                      <div className="half bottom">
                        <p className="bold">Remaining time:</p>
                        <div>
                          <p>{counterTime.diff(now, this.state.format)}</p>
                          <select value={this.state.format} onChange={e => this.changeFormat(e)}
                                  className="counter-format">
                            {formats.map((format, i) => {
                              return <option key={i} value={format}>{format}</option>
                            })}
                          </select>
                        </div>
                      </div> :
                      <div className="half bottom" style={{justifyContent: 'center'}}>
                        <p>It is time! You can read a message now.</p>
                      </div>
                    }
                  </div>
                </Col>
                <Col xs={1}/>
                <Col xs={5} className="column center" style={{justifyContent: 'flex-start'}}>
                  {this.state.counter.message ?
                    <Checkbox checked={this.state.counter.message && counterTime.isBefore(now)} type="message"
                              position="self-align-end" readOnly/> : null}
                  {this.state.counter.message && counterTime.isBefore(now) ?
                    <Textarea value={this.state.counter.message}
                              rows={7}
                              readOnly/> : <div></div>
                  }
                  <Button onClick={this.onOpen}>Delete</Button>
                </Col>
              </Row>
            </Field>
          </Col>
        </Row>
      </Container>
    )
  }
}

export default compose(
  withAuthorization(authCondition),
  withRouter
)(CounterDetails)