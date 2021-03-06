// @flow
import React, { Component } from 'react'
import Drawer from 'material-ui/Drawer'
import { connect } from 'react-redux'
import { isInsertMode } from '#/Editor.Core/selector/display'
import { createStructuredSelector } from 'reselect'
import { Editor } from '#/Editor.Core'
import List from 'material-ui/List/List'
import Subheader from 'material-ui/Subheader'
import TextField from 'material-ui/TextField'
import {
  LayoutPlugin,
  ContentPlugin
} from '#/Editor.Core/service/plugin/classes'
import Item from './Item'
import Provider from '../Provider'

type Props = {
  isInsertMode: boolean,
  editor: Editor
}

class Raw extends Component {
  constructor(props: Props) {
    super(props)
    this.state = {
      searchFilter: (a: any) => a,
      isSearching: false
    }

    this.onSearch = this.onSearch.bind(this)
  }

  state: {
    searchFilter: Function,
    isSearching: boolean
  }

  componentDidUpdate() {
    const input = this.input
    if (input && this.props.isInsertMode && input instanceof HTMLElement) {
      setTimeout(() => {
        const e = input.querySelector('input')
        if (e) {
          e.focus()
        }
      }, 100)
    }
  }

  input: Component<*, *, *>

  onRef = (component: Component<*, *, *>) => {
    this.input = component
  }

  onSearch = (e: Event) => {
    const target = e.target
    if (target instanceof HTMLInputElement) {
      this.setState({
        searchFilter: ((v: any) => ({ text = '' }: Object) =>
          text.toLowerCase().indexOf(v) > -1)(target.value.toLowerCase()),
        isSearching: target.value.length > 0
      })
    }
  }

  render() {
    const { isInsertMode, editor: { plugins } } = this.props
    const { searchFilter } = this.state
    const content = plugins.plugins.content.filter(searchFilter)
    const layout = plugins.plugins.layout.filter(searchFilter)

    return (
      <Drawer className="ory-toolbar-drawer" open={isInsertMode}>
        <Subheader>添加组件</Subheader>
        <div style={{ padding: '0 16px' }} ref={this.onRef}>
          <TextField
            hintText="搜索组件"
            fullWidth
            onChange={this.onSearch}
          />
        </div>
        <List>
          {content.length ? <Subheader>组件</Subheader> : null}
          {content.map((plugin: ContentPlugin, k: Number) => {
            const initialState = plugin.createInitialState()

            return (
              <Item
                plugin={plugin}
                key={k}
                insert={{
                  content: {
                    plugin,
                    state: initialState
                  }
                }}
              />
            )
          })}
        </List>
        <List>
          {layout.length ? <Subheader>布局</Subheader> : null}
          {layout.map((plugin: LayoutPlugin, k: Number) => {
            const initialState = plugin.createInitialState()
            const children = plugin.createInitialChildren()

            return (
              <Item
                plugin={plugin}
                key={k}
                insert={{
                  ...children,
                  layout: {
                    plugin,
                    state: initialState
                  }
                }}
              />
            )
          })}
        </List>
      </Drawer>
    )
  }
}

const mapStateToProps = createStructuredSelector({ isInsertMode })

const Decorated = connect(mapStateToProps)(Raw)

const Toolbar = (props: any) => (
  <Provider {...props}>
    <Decorated {...props} />
  </Provider>
)

export default Toolbar
