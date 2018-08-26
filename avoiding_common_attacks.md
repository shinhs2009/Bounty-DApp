# Avoiding Common Attacks

At the end of project, I notice there's many points that can be attacked by malicious users.
I don't enough time to cover it, So I mentioned the weakness point and solutions here.

1. Bounty informations  
In frontend, I don't check validity of data, so there can be weakness point.  
First, Biggest one is overflow, because I don't check the entered data number. It can make the overflow problem. It can be solved by checking number of integer in frontend.  
Second, Users can make Bounty Reward bigger than their balance. It is Logic bugs, because in bounty contract Bounty Owner can accept many Works.
It can be solved by set maximum hunter number and checking the balance of bounty Owner.

2. Denial of Service Attack  
Malicious Users can attack by create Bounty iterately. I think it can be solved by Using Speed Bump Design Pattern.
