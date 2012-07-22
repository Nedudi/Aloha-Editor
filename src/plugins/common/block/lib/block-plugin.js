/*!
* Aloha Editor
* Author & Copyright (c) 2010 Gentics Software GmbH
* aloha-sales@gentics.com
* Licensed unter the terms of http://www.aloha-editor.com/license.html
*/

/**
 * @name block
 * @namespace Block plugin
 */
define([
  'aloha',
	'aloha/plugin',
	'jquery',
	'aloha/contenthandlermanager',
	'block/blockmanager',
	'block/sidebarattributeeditor',
	'block/block',
	'block/editormanager',
	'block/blockcontenthandler',
	'block/editor',
	'ui/ui',
	'ui/toggleButton',
	'i18n!block/nls/i18n',
	'i18n!aloha/nls/i18n',
	'jqueryui'
], function(
	Aloha,
 	Plugin,
 	jQuery,
 	ContentHandlerManager, 
	BlockManager,
 	SidebarAttributeEditor,
 	block,
 	EditorManager,
 	BlockContentHandler,
 	editor,
 	Ui,
 	ToggleButton, 
	i18n,
	i18nCore
) {
	"use strict";
	/**
	 * Register the 'block' plugin
	 */
	var BlockPlugin = Plugin.create( 'block', {
		
		/**
		 * default button configuration
		 */
		config: [], 

		settings: {},

//		dependencies: [ 'paste' ],

		init: function () {
			var that = this;

			// Register default block types
			BlockManager.registerBlockType('DebugBlock', block.DebugBlock);
			BlockManager.registerBlockType('DefaultBlock', block.DefaultBlock);

			// Register default editors
			EditorManager.register('string', editor.StringEditor);
			EditorManager.register('number', editor.NumberEditor);
			EditorManager.register('url', editor.UrlEditor);
			EditorManager.register('email', editor.EmailEditor);
			EditorManager.register('select', editor.SelectEditor);
			EditorManager.register('button', editor.ButtonEditor);

			// register content handler for block plugin
			ContentHandlerManager.register('block', BlockContentHandler);

			BlockManager.registerEventHandlers();
			BlockManager.initializeBlockLevelDragDrop();

			Aloha.bind('aloha-ready', function() {
				// When Aloha is fully loaded, we initialize the blocks.
				that._createBlocks();
				if (that.settings['sidebarAttributeEditor'] !== false) {
					SidebarAttributeEditor.init();
				}
			});

			// create the toolbar buttons
			this.createButtons();

			// apply specific configuration if an editable has been activated
			Aloha.bind('aloha-editable-activated', function (e, params) {
				that.applyButtonConfig(params.editable.obj);
			});
		},

		/**
		 * applies a configuration specific for an editable
		 * buttons not available in this configuration are hidden
		 * @param {Object} id of the activated editable
		 * @return void
		 */
		applyButtonConfig: function (obj) {

			var config = this.getEditableConfig(obj);

			if(config[0] === "dragdrop" && this.isDragDropEnabled()){
				this._toggleDragDropButton.show(true);
				this._toggleDragDropButton.setState(obj.data("block-dragdrop"));
			} else {
				this._toggleDragDropButton.show(false);
			}
		},

		createButtons: function () {
			var that = this;

			this._toggleDragDropButton = Ui.adopt("toggleDragDrop", ToggleButton, {
				tooltip: i18n.t('button.toggledragdrop.tooltip'),
				icon: 'aloha-icon aloha-icon-toggledragdrop',
				scope: 'Aloha.continuoustext',
				click: function(){ 
					if ( Aloha.activeEditable ) {
						var active_editable = Aloha.activeEditable.obj;
						var current_dragdrop_state = active_editable.data("block-dragdrop");
						active_editable.data("block-dragdrop", !current_dragdrop_state);

						if(jQuery(active_editable.hasClass("ui-sortable"))){
							var disabled = jQuery(active_editable).sortable( "option", "disabled" );
							jQuery(active_editable).sortable("option", "disabled", !disabled );	
						}

						jQuery(active_editable).find(".aloha-block.ui-draggable").each(function(){
							var disabled = jQuery(this).draggable( "option", "disabled" );
							jQuery(this).draggable("option", "disabled", !disabled );	
						});

						jQuery(active_editable).find(".aloha-block-handle").each(function(){
							jQuery(this).toggleClass("aloha-block-draghandle");	
						});

						// todo: don't allow as a dropzone
					}
				}
			});
		},

		/**
		 * checks whether drag & drop is enabled for blocks 
		 * @return boolean 
		 */
		isDragDropEnabled: function(){
			if(this.settings.dragdrop){
				// Normalize config
				return (
					this.settings.dragdrop === true   ||
					this.settings.dragdrop === 'true' ||
					this.settings.dragdrop === '1'
				);
			} else {
				return true // by default dragdrop is activated 
			}
		},

		/**
		 * Create blocks from default settings
		 */
		_createBlocks: function() {
			if (!this.settings.defaults) {
				this.settings.defaults = {};
			}
			jQuery.each(this.settings.defaults, function(selector, instanceDefaults) {
				jQuery(selector).alohaBlock(instanceDefaults);
			});
		},


	});

	/**
	 * See (http://jquery.com/).
	 * @name jQuery.fn
	 * @class
	 * See the jQuery Library  (http://jquery.com/) for full details.  This just
	 * documents the function and classes that are added to jQuery by this plug-in.
	 */

	/**
	 * Create Aloha blocks from the matched elements
	 * @api
	 * @param {Object} instanceDefaults
	 */
	jQuery.fn.alohaBlock = function(instanceDefaults) {
		instanceDefaults = instanceDefaults || {};
		jQuery(this).each(function(index, element) {
			BlockManager._blockify(element, instanceDefaults);
		});

		// Chain
		return jQuery(this);
	};

	// jQuery.fn.mahaloBlock = TODO
	return BlockPlugin;
});
