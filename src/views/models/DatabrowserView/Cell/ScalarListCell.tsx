import * as React from 'react'
import PopupWrapper from '../../../../components/PopupWrapper/PopupWrapper'
import {getScalarEditCell, CellRequirements} from './cellgenerator'
import {AtomicValue} from '../../../../types/utils'
import {atomicValueToString, stringToValue} from '../../../../utils/valueparser'
import {Field} from '../../../../types/types'
const classes: any = require('./ScalarListCell.scss')
import styled from 'styled-components'
import {variables, $p, Icon} from 'graphcool-styles'
import * as cx from 'classnames'
import {isEqual} from 'lodash'

interface State {
  values: AtomicValue[]
  filter: string
  newValue: string
  editingIndex: number
}

const Button = styled.button`
      padding: ${variables.size16};
      font-size: ${variables.size16};
      border: none;
      background: none;
      color: ${variables.gray50};
      border-radius: 2px;
      cursor: pointer;
      transition: color ${variables.duration} linear;

      &:hover {
        color: ${variables.gray70};
      }
    `

const CancelButton = styled(Button)`
      padding: 0;
      background: transparent;
      color: ${variables.gray50};

      &:hover {
        color: ${variables.gray60};
      }
    `

const SaveButton = styled(Button)`
      background: ${variables.green};
      color: ${variables.white};

      &:hover {
        color: ${variables.white80};
      }
    `

const Container = styled.div`
  width: 400px;
`

const InputWrapper = styled.div`
  input {
    padding: 0 !important;
  }
`

const DateInputWrapper = styled(InputWrapper)`
  > div, > div > div, > div > div > div {
    position: static !important;
  }
`

const NewInputWrapper = styled(InputWrapper)`
  input {
    color: ${variables.blue} !important;
  }
`

const NewDateInputWrapper = styled(NewInputWrapper)`
  > div, > div > div, > div > div > div {
    position: static !important;
  }
`

const Item = styled.div`
  i {
    opacity: 0;
    transition: .3s opacity;
  }
  
  &:hover {
    i {
      opacity: 1;
    }
  }
`

export default class ScalarListCell extends React.Component<CellRequirements, State> {

  private atomicField: Field = Object.assign({}, this.props.field, {isList: false})

  constructor(props: CellRequirements) {
    super(props)
    this.state = {
      filter: '',
      newValue: null,
      values: this.props.value ? this.props.value.slice() : [],
      editingIndex: null,
    }
  }

  getEditRequirements(index: number) {
    return {
      value: this.state.values[index],
      field: this.atomicField,
      projectId: this.props.projectId,
      nodeId: this.props.nodeId,
      methods: {
        save: this.handleValueChange.bind(this, index),
        cancel: () => null,
        onKeyDown: this.onKeyDown,
      },
    }
  }

  render() {
    const newRequirements: CellRequirements = {
      value: this.state.newValue,
      field: this.atomicField,
      projectId: this.props.projectId,
      nodeId: this.props.nodeId,
      inList: true,
      methods: {
        save: this.handleValueChange.bind(this, -1),
        cancel: () => null,
        onKeyDown: this.onKeyDown,
      },
    }
    return (
      <PopupWrapper onClickOutside={this.handleOutsideClick}>
        <div
          className={cx(
            $p.flex,
            $p.bgBlack50,
            $p.w100,
            $p.h100,
            $p.justifyCenter,
            $p.itemsCenter,
          )}
        >
          <Container
            className={cx(
              $p.bgWhite,
              $p.flex,
              $p.flexColumn,
              $p.relative,
            )}
          >
            <div className={classes.header}>
              <div className={classes.filter}>
                <Icon
                  src={require('assets/new_icons/search.svg')}
                  width={30}
                  height={30}
                  color={variables.blue}
                />
                <input
                  type='text'
                  placeholder='Filter...'
                  value={this.state.filter}
                  onChange={(e: any) => null}
                />
                <Icon
                  src={require('assets/icons/delete.svg')}
                  color={variables.red}
                  width={30}
                  height={30}
                  onClick={() => {
                    this.props.methods.save(null)
                    this.props.methods.cancel()
                  }}
                />
              </div>
            </div>
            <div
              className={cx(
                $p.flexAuto,
              )}
            >
              <div
                className={cx(
                  $p.f14,
                  $p.flex,
                  $p.flexRow,
                  $p.justifyBetween,
                  $p.black50,
                  $p.bb,
                  $p.bBlack10,
                  $p.pa25,
                  $p.itemsCenter,
                )}
                onClick={ () => this.setState({editingIndex: -1} as State)}
              >
                {this.state.editingIndex === -1 && (
                  this.props.field.typeIdentifier === 'DateTime' ? (
                    <NewDateInputWrapper className={$p.flexAuto}>
                      {getScalarEditCell(newRequirements)}
                    </NewDateInputWrapper>
                  ) : (
                    <NewInputWrapper className={$p.flexAuto}>
                      {getScalarEditCell(newRequirements)}
                    </NewInputWrapper>
                  )
                )}
                {!(this.state.editingIndex === -1) && (
                  <span className={classes.addNewText}>
                    {this.state.newValue ? (
                      <div>{atomicValueToString(this.state.newValue, this.props.field, true)}</div>
                    ) : (
                      'Add new item ...'
                    )}
                  </span>
                )}
                <Icon
                  className={this.state.newValue ? '' : classes.disabled}
                  onClick={() => this.addNewValue()}
                  src={require('assets/new_icons/add_new.svg')}
                  width={30}
                  height={30}
                  color={variables.blue}
                />
              </div>
              <div
                className={cx($p.overflowYScroll, $p.flexAuto)}
                style={{maxHeight: 'calc(100vh - 294px)'}}
              >
                {this.state.values.map((value, index) => (
                  <Item
                    key={index}
                    className={cx(
                      $p.f14,
                      $p.flex,
                      $p.flexRow,
                      $p.justifyBetween,
                      $p.black50,
                      $p.bb,
                      $p.bBlack10,
                      $p.pa25,
                      $p.itemsCenter,
                    )}
                    onClick={() => this.setEditingIndex(index)}
                  >
                    {this.state.editingIndex === index ? (
                      this.props.field.typeIdentifier === 'DateTime' ? (
                        <DateInputWrapper className={$p.flexAuto}>
                          {getScalarEditCell(this.getEditRequirements(index))}
                        </DateInputWrapper>
                      ) : (
                        <InputWrapper className={$p.flexAuto}>
                          {getScalarEditCell(this.getEditRequirements(index))}
                        </InputWrapper>
                      )
                    ) : (
                      <div>{atomicValueToString(value, this.props.field, true)}</div>
                    )}
                    <Icon
                      src={require('assets/new_icons/remove.svg')}
                      width={30}
                      height={30}
                      onClick={() => this.handleDeleteValue(index)}
                      color={variables.red}
                    />
                  </Item>
                ))}
              </div>
            </div>
            <div className={cx(
              $p.bgBlack04,
              $p.pa25,
              $p.flex,
              $p.flexRow,
              $p.justifyBetween,
              $p.itemsCenter,
            )}>
              <CancelButton onClick={this.props.methods.cancel}>
                Cancel
              </CancelButton>
              <SaveButton onClick={this.handleClose}>
                Save
              </SaveButton>
            </div>
          </Container>
        </div>
      </PopupWrapper>
    )
  }

  private setEditingIndex = (editingIndex: number) => {
    console.log('editing index', editingIndex)
    this.setState({editingIndex} as State)
  }

  private onKeyDown = (e: any) => {
    if (e.keyCode === 13) {
      this.addNewValue(stringToValue(e.target.value, this.props.field, true) as AtomicValue)
      e.stopPropagation()
      return
    }
    this.props.methods.onKeyDown(e)
  }

  private handleOutsideClick = () => {
    if (isEqual(this.state.values, this.props.value)) {
      this.props.methods.cancel()
      return
    }

    // only ask, if there was change
    if (confirm('Are you sure you want to discard unsaved changes?')) {
      this.props.methods.cancel()
    }
  }

  private handleClose = () => {
    this.props.methods.save(this.state.values, false)
  }

  private handleDeleteValue = (index: number) => {
    const result = this.state.values.slice(0)
    result.splice(index, 1)
    this.setState({
      values: result,
    } as State)
  }

  private handleValueChange = (index: number, value: AtomicValue) => {
    if (index === -1) {
      this.setState({newValue: value} as State)
    } else {
      const values = this.state.values
      values[index] = value
      this.setState({values} as State)
    }
  }

  private addNewValue = (value: AtomicValue = null) => {
    // we need this complicated check, as the boolean field false should be allowed
    if ((this.state.newValue === null || this.state.newValue === undefined)
        && (value === null || value === undefined)) {
      return
    }

    const values = this.state.values.slice(0)
    const newValue = value || this.state.newValue

    values.unshift(newValue)
    this.setState({
      newValue: '',
      values,
    } as State)
  }
}
