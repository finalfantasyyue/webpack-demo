'use strict';

import React from 'react'
import ReactDom from 'react-dom'
import '../../common/index'
import { funA } from './tree-shaking' // 引入但是没有用到，mode: 'production'会自动忽略到
import browser from './assets/images/brower.jpg'
import './index.less'

class Index extends React.Component {
  constructor() {
    super(...arguments)
    this.state = {
      Text: null
    }
    this.loadComponent = this.loadComponent.bind(this)
  }
  loadComponent() {
    import('./test.js').then(res => {
      this.setState({
        Text: res.default
      })
    })
  }
  render() {
    const { Text } = this.state
    return <div class="search-text">
      {
        Text ? <Text /> : null
      }
      <p>Search Text</p>
      <img src={ browser } width="200" height="150" alt="browser" onClick={ this.loadComponent.bind(this.loadComponent) } />
    </div>
  }
}

ReactDom.render(
  <Index />,
  document.getElementById('app')
)