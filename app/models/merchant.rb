require 'rubygems'
require 'nokogiri'
require 'open-uri'
require 'json'
require 'pp'

class Merchant < ActiveRecord::Base
  
  ## This method will extract all information from the webpage
  def self.grab_original_content(url=nil)
    ## EXAMPLE USING ZED451.COM
    ## url must be arg to this method
    url = "http://www.zed451.com"
    content = Nokogiri::HTML(open(url))
    ## pp content.css('title')    
  end
  
  ## This method should be implemented to collect json data
  ## from view/controller and store it as a entry in the
  ## merchant table
  def self.add_merchant(content)
    m = Merchant.new
    m.name = content["name"]
    m.business = content["business"]
    m.data = content.clone
  end
  
  
end