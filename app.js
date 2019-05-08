//  BUDGET CONTROLLER
var budgetController = (function() {
  // Some code

  const Expense = function(id, desc, value) {
    this.id = id;
    this.desc = desc;
    this.value = value;
  };
  const Income = function(id, desc, value) {
    this.id = id;
    this.desc = desc;
    this.value = value;
  };

  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    }
  };

  return {
    addItem: function(type, des, val) {
      let newItem, ID;

      //create ID
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      //create new item based on 'inc' or 'exp' type
      if (type === "exp") {
        newItem = new Expense(ID, des, val);
      } else if (type === "inc") {
        newItem = new Income(ID, des, val);
      }

      //push it in to our data structure
      data.allItems[type].push(newItem);

      //return the new element
      return newItem;
    }
  };
})();

//  UI CONTROLLER
let UIController = (function() {
  const DOMstrings = {
    inputType: ".add__type",
    inputDesc: ".add__description",
    inputValue: ".add__value",
    inputBtn: ".add__btn",
    incomeContainer: ".income__list",
    expensesContainer: ".expenses__list"
  };

  return {
    //gets inputs for creating an item object
    getInput: function() {
      return {
        type: document.querySelector(DOMstrings.inputType).value, // inc or exp
        desc: document.querySelector(DOMstrings.inputDesc).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      };
    },

    getDOMstrings: function() {
      return DOMstrings;
    },

    addListItem: function(obj, type) {
      var html, newHtml, element;
      // 1. create html string with placeholder text

      if (type === "inc") {
        element = DOMstrings.incomeContainer;
        html =
          '<div class="item clearfix" id="income-%id%"> <div class="item__description">%desc%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div> </div></div>';
      } else if (type === "exp") {
        element = DOMstrings.expensesContainer;
        html =
          '<div class="item clearfix" id="expense-%id%"><div class="item__description">%desc%</div> <div class="right clearfix"><div class="item__value">%value%</div> <div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div></div></div>';
      }

      // 2. replace the text with actual data
      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%desc%", obj.desc);
      newHtml = newHtml.replace("%value%", obj.value);

      // 3. instert into the DOM
      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },
    // 4. clear the input fields
    clearFields: function() {
      let fields, fieldsArray;

      fields = document.querySelectorAll(
        DOMstrings.inputDesc + ", " + DOMstrings.inputValue
      );

      fieldsArray = Array.prototype.slice.call(fields);

      fieldsArray.forEach(function(curr, i, arr) {
        curr.value = "";
      });

      fieldsArray[0].focus();
    }
  };
})();

//  GLOBAL APP CONTROLLER
let controller = (function(budgetCtrl, UICtrl) {
  // attatch all event listeners
  let setupEventListeners = function() {
    const DOM = UICtrl.getDOMstrings();
    document.querySelector(DOM.inputBtn).addEventListener("click", function() {
      ctrlAddItem();
    });

    document.addEventListener("keypress", function(e) {
      if (e.keyCode === 13 || e.which === 13) {
        ctrlAddItem();
      }
    });
  };

  let updateBudget = function() {
    // 1. calc the budget
    // 2. return the budget
    // 3. display the budget on UI
  };

  let ctrlAddItem = function() {
    let input, newItem;

    // 1. get input data
    input = UICtrl.getInput();
    if (input.desc !== "" && !isNaN(input.value) && input.value > 0) {
      // 2. add item to the budget controller
      newItem = budgetController.addItem(input.type, input.desc, input.value);

      // 3. add the item to UI
      UICtrl.addListItem(newItem, input.type);

      // 4. Clear the fields
      UICtrl.clearFields();

      // 5. calculate and update budget
      updateBudget();
    }
  };

  return {
    init: function() {
      setupEventListeners();
    }
  };
})(budgetController, UIController);

controller.init();
