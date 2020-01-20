/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablecellproperties/commands/tablecellpropertycommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';

import { findAncestor } from '../../commands/utils';

/**
 * The table cell attribute command.
 *
 * The command is a base command for other table cell attributes commands.
 *
 * @extends module:core/command~Command
 */
export default class TableCellPropertyCommand extends Command {
	/**
	 * Creates a new `TableCellPropertyCommand` instance.
	 *
	 * @param {module:core/editor/editor~Editor} editor Editor on which this command will be used.
	 * @param {String} attributeName Table cell attribute name.
	 */
	constructor( editor, attributeName ) {
		super( editor );

		this.attributeName = attributeName;
	}

	/**
	 * @inheritDoc
	 */
	refresh() {
		const editor = this.editor;
		const selection = editor.model.document.selection;

		const tableCell = findAncestor( 'tableCell', selection.getFirstPosition() );

		this.isEnabled = !!tableCell;
		this.value = this._getAttribute( tableCell );
	}

	/**
	 * Executes the command.
	 *
	 * @fires execute
	 * @param {Object} [options]
	 * @param {*} [options.value] If set the command will set the attribute on selected table cells.
	 * If it is not set the command will remove the attribute from selected table cells.
	 * @param {module:engine/model/batch~Batch} [options.batch] Pass batch instance to the command for creating single undo step.
	 */
	execute( options = {} ) {
		const model = this.editor.model;
		const selection = model.document.selection;

		const { value, batch } = options;

		const tableCells = Array.from( selection.getSelectedBlocks() )
			.map( element => findAncestor( 'tableCell', model.createPositionAt( element, 0 ) ) );

		model.enqueueChange( batch || 'default', writer => {
			if ( value ) {
				tableCells.forEach( tableCell => writer.setAttribute( this.attributeName, value, tableCell ) );
			} else {
				tableCells.forEach( tableCell => writer.removeAttribute( this.attributeName, tableCell ) );
			}
		} );
	}

	/**
	 * Returns attribute value for a table cell.
	 *
	 * @param {module:engine/model/element~Element} tableCell
	 * @returns {String|undefined}
	 * @private
	 */
	_getAttribute( tableCell ) {
		if ( !tableCell ) {
			return;
		}

		return tableCell.getAttribute( this.attributeName );
	}
}
