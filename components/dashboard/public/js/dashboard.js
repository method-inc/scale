function Dashboard(options) {

  options = options || {};
  this.projects = ko.observableArray([]);

  this.addingProject = ko.observable(false);
  this.projectName = ko.observable("");
  this.projectDesc = ko.observable("");
  this.projectModalHeader = ko.computed(function(){
    return "New Project";
  }, this);

  this.loadProjects();
}

Dashboard.prototype = {
  
  loadProjects: function() {
    var self = this;

    $.get('/api/project', function(response){
      console.log("load projects:", response);

      if (response.data) {
        _.each(response.data, function(p) {
          self.projects.push(new Project(p, self));
        });
      }
    });
  },

  startAddProject: function() {
    this.addingProject(true);
  },

  saveProject: function() {
    if (this.projectName().trim() === "") return;

    var details = {
      name:this.projectName(),
      description:this.projectDesc()
    };
    var new_project = new Project(details, this);
    this.projects.push(new_project);
    this.cancelCreateProject();
    $.ajax({
      type: 'POST',
      url: '/api/project',
      data: details,
      dataType: 'json'
    }).done(
      function (response) {
        if (response.data) new_project.id(response.data._id);
      }
    );
  },

  cancelCreateProject: function() {
    this.addingProject(false);
    this.projectName("");
    this.projectDesc("");
  }

};