
({
	formatData : function(component, event, helper) {
		var data = component.get("v.data");
		if(data){
			var formattedData = {};
			var columns = data.columns;
			var dataTypeByName = {};
			columns.forEach(function(column){
				dataTypeByName[column.name] = column.dataType
			});
			var rows = data.rows;
			var formattedRows = [];
			rows.forEach(function(row){
				var formattedRow = {};
				var fields = [];
				var type = '';
				for(var key in row){
					if(dataTypeByName[key]){
						var value = '';
						if(dataTypeByName[key] != 'BOOLEAN' && 
						   dataTypeByName[key] !=  'CURRENCY' && 
						   dataTypeByName[key] != 'DATE' && 
						   dataTypeByName[key] != 'DATETIME' && 
						   dataTypeByName[key] != 'EMAIL' && 
						   dataTypeByName[key] != 'NUMBER' && 
						   dataTypeByName[key] != 'PHONE' && 
						   dataTypeByName[key] != 'URL'){
						   	if(dataTypeByName[key] == 'ADDRESS'){
						   		if(row[key].street){
						   			value += row[key].street + ' ';
						   		}
						   		if(row[key].city){
						   			value += row[key].city + ' ';
						   		}
						   		if(row[key].state){
						   			value += row[key].state + ' ';
						   		}
						   		if(row[key].postalCode){
						   			value += row[key].postalCode + ' ';
						   		}
						   		if(row[key].country){
						   			value += row[key].country;
						   		}
						   	}
							type = 'STRING'
						} else{
							type = dataTypeByName[key]
						}
						if(!value){
							value = row[key];
						}
						if(type == 'URL' && value){
							if(!value.startsWith('http://') && !value.startsWith('https://')){
								value = 'http://' + value;
							}
						}
						var field = {
							"name":key,
							"value":value,
							"dataType":type
						}
						fields.push(field);
					}
				}
				var sortedFields = [];
				columns.forEach(function(column, i){
					fields.forEach(function(field){
						if(field.name === column.name){
							sortedFields[i] = field;
						}
					})
				})
				formattedRow.fields = sortedFields;
				formattedRows.push(formattedRow);
			});
			formattedData.rows = formattedRows;
			formattedData.columns = columns;
			component.set('v.formattedData', formattedData);
			helper.createRowComponents(component,event,helper);
		}
	},
	createRowComponents : function(component,event,helper){
		var formattedData = component.get('v.formattedData');
		var body = [];
		
		var createRowCallback = function(newCmp, status, errorMessage){
			if(status === 'SUCCESS'){
				body.push(newCmp);
				component.set('v.body', body);
				component.set('v.showTable', true);
			}
		}

		if(formattedData.rows > 0) {
			formattedData.rows.forEach(function(row){
				$A.createComponent(
					"c:strike_row",
					{
						"fields": row.fields
					},
					createRowCallback
				)
			});

			helper.sortTable(component, null, helper);
		}
		else {
			// we don't have any new rows so we need to set the body here (createRowCallback doesn't get called)
			component.set('v.body', body);
		}
		
	},
	sortTable : function(component, event, helper){
            var selectedColumnName = event.currentTarget.dataset.columnName || component.get('v.currentSortColumn');
			var body = component.get('v.body');

			body.forEach(function(row){
				var fields = row.get('v.fields');

				fields.forEach(function(field){
					if(field.name === selectedColumnName){
						row.set('v.sortFieldValue', field.value);
					}
				});
			});

			var ascending = component.get('v.ascending');

			if(selectedColumnName != component.get('v.currentSortColumn')){
				
				component.set('v.ascending', true);
				ascending = true;
			} else {
				ascending = !ascending
				component.set('v.ascending', ascending)
			}

			
			body.sort(function(a,b){
				if(ascending){
					if (a.get('v.sortFieldValue').toUpperCase() < b.get('v.sortFieldValue').toUpperCase()) {
						return -1;
					}
					if (a.get('v.sortFieldValue').toUpperCase() > b.get('v.sortFieldValue').toUpperCase()) {
						return 1;
					}
				} else{
					if (a.get('v.sortFieldValue').toUpperCase() < b.get('v.sortFieldValue').toUpperCase()) {
						return 1;
					}
					if (a.get('v.sortFieldValue').toUpperCase() > b.get('v.sortFieldValue').toUpperCase()) {
						return -1;
					}
				}
			});

			
			
			component.set('v.body', body);
			component.set('v.currentSortColumn', selectedColumnName);
		}
})