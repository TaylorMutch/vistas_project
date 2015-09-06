/**
 * Created by Taylor on 9/6/2015.
 */

var terrain = can.Model.extend({
    findAll: function() {
        return $.ajax({
            url: '/terrains/',
            type: 'get',
            dataType: 'json'
        });
    },
    findOne: function(params) {
        return $.ajax({
            url: '/terrains/'+params.id,
            type: 'get',
            dataType: 'json'
        });
    },
    create: 'POST /terrains/',
    destroy: 'DELETE /terrains/{id}'
}, {});