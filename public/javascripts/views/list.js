define(
    ['jquery',
        'backbone',
        'collections/list',
        'views/task',
        'data/demo'
    ],

    function (
        $,
        Backbone,
        List,
        TaskView,
        demoData
    ) {

        var ListView = Backbone.View.extend({

            el: $("#main .children"),

            events: {
                'click #add': 'addTask'
            },

            initialize: function () {
                Tasks = this.collection = new List();

                this.listenTo(this.collection, 'add', this.renderTask);

                /** Load demo data **/
                function loadDemoData() {
                    for (var i = 0; i < demoData.length; i++) {
                        var task = Tasks.add(demoData[i]);
                        task.save();
                    }
                }

                function success(data) {
                    // load demo data if the server returns nothing
                    if (data.length === 0)
                        loadDemoData();
                }

                this.collection.fetch({
                    success: success,
                    error: function () {
                        // switch to localforage database if server isn't present and fetch again
                        window.hackflowyOffline=true;
                        $('#header').append('<div class="alert-box secondary round">Running in offline mode, data may be lost </div>');
                        Tasks.fetch({
                            success: success
                        });
                    }
                });

            },

            render: function () {
                this.collection.each(function (task) {
                    this.renderTask(task);
                }, this);
            },

            renderTask: function (task) {
                var taskView = new TaskView({
                    model: task
                });
                var a = taskView.render();
                if (a.model.get('parentId') === 0) {
                    // inset it at the end of the root list
                    this.$el.append(a.el);
                } else {
                    // insert after the currently edited sibling (same parent)
                    // or after the last sibling
                    var parent = $('*[data-id="' + a.model.get('parentId') + '"]');
                    var siblings = $('*[data-parent-id="' + a.model.get('parentId') + '"]').parents('li')
                    if (siblings.length>0){
                        var editingSibling = siblings.filter('.editing')
                        var lastSibling = siblings.filter(':last');
                        if (editingSibling)
                            a.$el.insertAfter(editingSibling);
                        else
                            a.$el.insertAfter(lastSibling);
                    }
                    else if (parent.length < 0) {
                        a.$el.insertAfter(parent.parents('li:first'));
                    } else {
                        // TODO deal with loading order
                        console.error("Parent not rendered yet: ", {
                            selector: parent.selector,
                            task: task
                        });
                        this.$el.append(a.el);
                    }
                }
            }

        });

        return ListView;

    });
