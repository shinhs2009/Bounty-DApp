App = {
  web3Provider: null,
  contracts: {},

  initWeb3: function() {
    // Is there an injected web3 instance?
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      // If no injected web3 instance is detected, fall back to Ganache
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
    }
    web3 = new Web3(App.web3Provider);

    var account = web3.eth.accounts[0];

    web3.eth.getBalance(account, function(error, result){
      if(!error) {
        balance = web3.fromWei(result, 'ether');
        balance = JSON.stringify(balance);
      }
      else {
        console.error(error);
      }
      
      $(".account-status").empty();
      $(".account-status").append("Your account has " + balance + " ETH in<br>" + account);
    })

    var accountInterval = setInterval(function() {
      if (web3.eth.accounts[0] !== account) {
        account = web3.eth.accounts[0];
        App.initWeb3();
      }
    }, 100);

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('BountyHub.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var BountyHubArtifact = data;
      App.contracts.BountyHub = TruffleContract(BountyHubArtifact);
    
      // Set the provider for our contract
      App.contracts.BountyHub.setProvider(App.web3Provider);
    
      // Use our contract to retrieve and mark the adopted pets
      //return App.markAdopted();

      return App.loadPostedBounty();
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '#all', function() {
      App.initHTML();
      App.loadAllBounty();
    });

    $(document).on('click', '#posted', function() {
      App.initHTML();
      App.loadPostedBounty();
    });

    $(document).on('click', '#finished', function() {
      App.initHTML();
      App.loadFinishedBounty();
    });

    $(document).on('click', '#own', function() {
      App.initHTML();
      App.loadOwnBounty();
    });

    $(document).on('click', '#register', function() {
      App.initHTML();
      var registerTemplate = $("#registerTemplate");
      $("#bountyRow").append(registerTemplate.html());
    });

    $(document).on('click', '#bountyRegister', function() {
      var title = $('#title').val();
      var reward = Number($('#reward').val() * 1000000000000000000);
      console.log(reward);
      var description = $('#description').val();

      App.registerBounty(title, description, reward);
    });

    $(document).on('click', '.finish-bounty', function(event) {
      var address = $(event.target).attr('id');
      App.changeStatusFinish(address);
    });

    $(document).on('click', '.show-status', function(event) {
      var address = $(event.target).attr('id');
      App.submitStatusCheck(address, $(event.target).parent(".bounty-card"));
    });

    $(document).on('click', '.submit-work', function(event) {
      var address = $(event.target).attr('id');
      var comment = prompt("Please report the results of your work simply.");
      App.submitWork(address, comment);
    });

    $(document).on('click', '.show-work', function(event) {
      var address = $(event.target).attr('id');
      App.showWork(address, $(event.target).parent(".bounty-card"));
    });

    $(document).on('click', '.hide-work', function(event) {
      $(event.target).parent(".bounty-card").find('.col').remove();
      $(event.target).attr('class', 'card-link link-2 show-work');
      $(event.target).text('Show Work');
    });

    $(document).on('click', '.btn-default', function(event) {
      var address = $(event.target).attr('id').split("-");
      App.reviewWork(address[0], address[1], $(event.target));
    });

    $(document).on('click', '.accept-check', function() {
      var address = $(event.target).attr('id');
      App.acceptCheck(address);
    });
  },
  
  loadAllBounty: function() {
    var bountyHubInstance;
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.BountyHub.deployed().then(function(instance) {
        bountyHubInstance = instance;
        
        return bountyHubInstance.getAllBountyAddress.call({from: account});
      }).then(function(bountyAddress) {
        for(i=0; i<bountyAddress.length; i++) {
          var bountyRow = $("#bountyRow");
          var bountyTemplate = $("#bountyTemplate");
          if (bountyAddress[i] !== '0x0000000000000000000000000000000000000000') {
            var result = bountyHubInstance.getBountyInfo.call(bountyAddress[i], {from: account});
            result.then(function(result) {
              bountyTemplate.find(".card-title").text(result[1]);
              bountyTemplate.find(".card-subtitle").text(result[0]);
              bountyTemplate.find(".card-text").html(result[2] + "<br>" + "reward : " + (result[3] / 1000000000000000000) + " ETH<br>" + "status : " + ((result[4].toNumber())?"Finished":"Posted"));
              bountyTemplate.find(".card-link").attr("id", result[5]);
              // If account equal bountyOwner, this bounty is made by owner.
                if(account === result[0]) {
                  bountyTemplate.find(".link-1").text("Finish Bounty");
                  if(result[4].toNumber()) {
                    bountyTemplate.find(".link-1").attr("class", "card-link link-1");
                  } else {
                    bountyTemplate.find(".link-1").attr("class", "card-link link-1 finish-bounty");
                  }
                  bountyTemplate.find(".link-2").text("Show Work");
                  bountyTemplate.find(".link-2").attr("class", "card-link link-2 show-work");
                } else {
                  bountyTemplate.find(".link-1").text("Show Status");
                  bountyTemplate.find(".link-1").attr("class", "card-link link-1 show-status");
                  bountyTemplate.find(".link-2").text("");
                  bountyTemplate.find(".link-2").attr("class", "card-link link-2 no-show");
                }
                /*
                bountyTemplate.find(".link-1").text("Finish Bounty");
                bountyTemplate.find(".link-1").attr("class", "card-link link-1 finish-bounty");
                bountyTemplate.find(".link-2").text("Show Work");
                bountyTemplate.find(".link-2").attr("class", "card-link link-2 show-work");
              } else {
                bountyHubInstance.getParticipationStatus(tempAddress, {from: account}).then(function(result) {
                  // If participation status is false, account owner can submit work.
                  if(result === false) {
                    bountyTemplate.find(".link-1").text("Submit Work");
                    bountyTemplate.find(".link-1").attr("class", "card-link link-1 submit-work");
                    bountyTemplate.find(".link-2").text("");
                    bountyTemplate.find(".link-2").attr("class", "card-link link-2 no-show");
                  } else {
                  }
                });
                */
              bountyRow.append(bountyTemplate.html());
            });
          }
        }
      });
    });
  },

  loadPostedBounty: function() {
    var bountyHubInstance;
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.BountyHub.deployed().then(function(instance) {
        bountyHubInstance = instance;
        
        return bountyHubInstance.getAllBountyAddress.call({from: account});
      }).then(function(bountyAddress) {
        for(i=0; i<bountyAddress.length; i++) {
          var bountyRow = $("#bountyRow");
          var bountyTemplate = $("#bountyTemplate");
          if (bountyAddress[i] !== '0x0000000000000000000000000000000000000000') {
            var result = bountyHubInstance.getBountyInfo.call(bountyAddress[i], {from: account});
            result.then(function(result) {
              if(result[4].toNumber() == 0) {
                bountyTemplate.find(".card-title").text(result[1]);
                bountyTemplate.find(".card-subtitle").text(result[0]);
                bountyTemplate.find(".card-text").html(result[2] + "<br>" + "reward : " + (result[3] / 1000000000000000000) + " ETH<br>" + "status : " + ((result[4].toNumber())?"Finished":"Posted"));
                bountyTemplate.find(".card-link").attr("id", result[5]);
                if(account === result[0]) {
                  bountyTemplate.find(".link-1").text("Finish Bounty");
                  if(result[4].toNumber()) {
                    bountyTemplate.find(".link-1").attr("class", "card-link link-1");
                  } else {
                    bountyTemplate.find(".link-1").attr("class", "card-link link-1 finish-bounty");
                  }
                  bountyTemplate.find(".link-2").text("Show Work");
                  bountyTemplate.find(".link-2").attr("class", "card-link link-2 show-work");
                } else {
                  bountyTemplate.find(".link-1").text("Show Status");
                  bountyTemplate.find(".link-1").attr("class", "card-link link-1 show-status");
                  bountyTemplate.find(".link-2").text("");
                  bountyTemplate.find(".link-2").attr("class", "card-link link-2 no-show");
                }

                bountyRow.append(bountyTemplate.html());
              }
            });
          }
        }
      });
    });
  },

  loadFinishedBounty: function() {
    var bountyHubInstance;
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.BountyHub.deployed().then(function(instance) {
        bountyHubInstance = instance;
        
        return bountyHubInstance.getAllBountyAddress.call({from: account});
      }).then(function(bountyAddress) {
        for(i=0; i<bountyAddress.length; i++) {
          var bountyRow = $("#bountyRow");
          var bountyTemplate = $("#bountyTemplate");
          if (bountyAddress[i] !== '0x0000000000000000000000000000000000000000') {
            var result = bountyHubInstance.getBountyInfo.call(bountyAddress[i], {from: account});
            result.then(function(result) {
              if(result[4].toNumber() == 1) {
                bountyTemplate.find(".card-title").text(result[1]);
                bountyTemplate.find(".card-subtitle").text(result[0]);
                bountyTemplate.find(".card-text").html(result[2] + "<br>" + "reward : " + (result[3] / 1000000000000000000) + " ETH<br>" + "status : " + ((result[4].toNumber())?"Finished":"Posted"));
                bountyTemplate.find(".card-link").attr("id", result[5]);
                if(account === result[0]) {
                  bountyTemplate.find(".link-1").text("Finish Bounty");
                  if(result[4].toNumber()) {
                    bountyTemplate.find(".link-1").attr("class", "card-link link-1");
                  } else {
                    bountyTemplate.find(".link-1").attr("class", "card-link link-1 finish-bounty");
                  }
                  bountyTemplate.find(".link-2").text("Show Work");
                  bountyTemplate.find(".link-2").attr("class", "card-link link-2 show-work");
                } else {
                  bountyTemplate.find(".link-1").text("Show Status");
                  bountyTemplate.find(".link-1").attr("class", "card-link link-1 show-status");
                  bountyTemplate.find(".link-2").text("");
                  bountyTemplate.find(".link-2").attr("class", "card-link link-2 no-show");
                }
                
                bountyRow.append(bountyTemplate.html());
              }
            });
          }
        }
      });
    });
  },

  loadOwnBounty: function() {
    var bountyHubInstance;
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.BountyHub.deployed().then(function(instance) {
        bountyHubInstance = instance;
        
        return bountyHubInstance.getBountyAddressByOwner.call(account, {from: account});
      }).then(function(bountyAddress) {
        for(i=0; i<bountyAddress.length; i++) {
          var bountyRow = $("#bountyRow");
          var bountyTemplate = $("#bountyTemplate");
          if (bountyAddress[i] !== '0x0000000000000000000000000000000000000000') {
            var result = bountyHubInstance.getBountyInfo.call(bountyAddress[i], {from: account});
            result.then(function(result) {
              bountyTemplate.find(".card-title").text(result[1]);
              bountyTemplate.find(".card-subtitle").text(result[0]);
              bountyTemplate.find(".card-text").html(result[2] + "<br>" + "reward : " + (result[3] / 1000000000000000000) + " ETH<br>" + "status : " + ((result[4].toNumber())?"Finished":"Posted"));
              bountyTemplate.find(".card-link").attr("id", result[5]);
              if(account === result[0]) {
                bountyTemplate.find(".link-1").text("Finish Bounty");
                if(result[4].toNumber()) {
                  bountyTemplate.find(".link-1").attr("class", "card-link link-1");
                } else {
                  bountyTemplate.find(".link-1").attr("class", "card-link link-1 finish-bounty");
                }
                bountyTemplate.find(".link-2").text("Show Work");
                bountyTemplate.find(".link-2").attr("class", "card-link link-2 show-work");
              } else {
                bountyTemplate.find(".link-1").text("Show Status");
                bountyTemplate.find(".link-1").attr("class", "card-link link-1 show-status");
                bountyTemplate.find(".link-2").text("");
                bountyTemplate.find(".link-2").attr("class", "card-link link-2 no-show");
              }

              bountyRow.append(bountyTemplate.html());
            });
          }
        }
      });
    });
  },

  registerBounty: function(title, description, reward) {
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];
      App.contracts.BountyHub.deployed().then(function(instance) {
        bountyHubInstance = instance;

        console.log(title);
        console.log(description);
        console.log(reward);
        return bountyHubInstance.createBounty(title, description, reward);
      }).then(function(result) {
        console.log(account + " " + result);
      });
    });
  },

  changeStatusFinish: function(bountyAddress) {
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];

      App.contracts.BountyHub.deployed().then(function(instance) {
        bountyHubInstance = instance;
        bountyHubInstance.getBountyInfo.call(bountyAddress, {from: account}).then(function(result) {
          var reward = result[3].toNumber();

          bountyHubInstance.getAcceptedHunter.call(bountyAddress).then(function(hunter) {
            hunter.forEach(function(hunter) {
              bountyHubInstance.payBounty(bountyAddress, hunter, {value : reward});
            });
          }).then(function() {
            bountyHubInstance.finishBounty(bountyAddress, {from: account});
          })
        });
      });
    })
  },

  showAllWork: function(bountyAddress) {
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];
      App.contracts.BountyHub.deployed().then(function(instance) {
        bountyHubInstance = instance;

        return bountyHubInstance.getHunterAddress.call(bountyAddress, {from: account});
      }).then(function(hunter) {
        for(i=0; i<=hunter.length; i++) {
          var result = bountyHubInstance.getWork.call(bountyAddress, hunter[i], {from: account});
          result.then(function (){
            console.log(result[0]);
            console.log(result[1]);
          });
        }
      });
    });
  },

  submitStatusCheck: function(bountyAddress, bountyTemplate) {
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];
      App.contracts.BountyHub.deployed().then(function(instance) {
        bountyHubInstance = instance;
        bountyHubInstance.getParticipationStatus.call(bountyAddress, {from: account}).then(function(result) {
          console.log(result);
          if(result === false) {
            alert("You are not participated in this bounty");
            bountyTemplate.children(".link-2").text("Submit work");
            bountyTemplate.children(".link-2").attr("class", "card-link link-2 submit-work");
          } else {
            alert("You already participated in this bounty");
            bountyTemplate.children(".link-2").text("Accept check");
            bountyTemplate.children(".link-2").attr("class", "card-link link-2 accept-check");
          }
        });
      });
    });
  },

  submitWork: function(bountyAddress, comment) {
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];
      App.contracts.BountyHub.deployed().then(function(instance) {
        bountyHubInstance = instance;
        bountyHubInstance.submitWork(bountyAddress, comment, {from: account});
      });
    });
  },

  showWork: function(bountyAddress, bountyTemplate) {
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];
      App.contracts.BountyHub.deployed().then(function(instance) {
        bountyHubInstance = instance;
        bountyHubInstance.getHunterAddress.call(bountyAddress, {from: account}).then(function(result) {
          result.forEach(function(result) {
            var hunterAddress = result;
            var workTemplate = $("#workTemplate");
            bountyHubInstance.getWork.call(bountyAddress, result).then(function(work) {
              workTemplate.find('.card-subtitle').text(hunterAddress);
              workTemplate.find('.card-text').text(work[0]);
              if(work[1] === true) {
                workTemplate.find('.btn-default').text('Accepted');
                workTemplate.find('.btn-default').attr('class', 'btn btn-success');
              }
              workTemplate.find('.btn-default').attr('id', bountyAddress + "-" + hunterAddress);
              bountyTemplate.find('.show-work').attr('class', 'card-link link-2 hide-work');
              bountyTemplate.find('.hide-work').text('Hide Work');

              bountyTemplate.append(workTemplate.html());
            });
          });
        });
      });
    });
  },

  reviewWork: function(bountyAddress, hutnerAddress, button) {
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];
      App.contracts.BountyHub.deployed().then(function(instance) {
        bountyHubInstance = instance;
        bountyHubInstance.reviewWork(bountyAddress, hutnerAddress, {from: account}).then(function(result) {
          button.attr('class', "btn btn-success");
          button.text('Accepted');
        });

        // bountyHubInstance.getAcceptedHunter(bountyAddress, {from: account}).then(function(result) {
        //   console.log(result);
        // });
      });
    });
  },

  acceptCheck: function(bountyAddress) {
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];
      App.contracts.BountyHub.deployed().then(function(instance) {
        bountyHubInstance = instance;
        bountyHubInstance.getAcceptedHunter(bountyAddress, {from: account}).then(function(result) {
          if(result.length == 0) {
            alert("Sorry, Your work is not good for me")
          } else {
            for(var i=0; i<result.length; result++) {
              console.log(result[i]);
              if(result[i] === account) {
                alert("You are accepted! Wait for Reward");
              } else {
                alert("Sorry, Your work is not good for me");
              }
            }
          }
        });
      });
    });
  },

  initHTML: function() {
    var bountyRow = $("#bountyRow");
    //var bountyTemplate = $("#bountyTemplate");
    bountyRow.empty();
  }
}

$(function() {
  $(window).load(function() {
    App.initWeb3();
  });
});
