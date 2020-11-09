#!/usr/bin/env ruby

require 'optparse'
require 'yaml'

class Deployment

  attr_reader :old_tag, :new_tag, :app_name

  def initialize(options)
    @file           = options[:file]
    @increment      = options[:increment]
    @container_name = options[:container]
    @major_update   = options[:major_update]
    @new_tag        = options[:tag]

    @deployment     = parse_yaml(@file)
    @app_name       = fetch_app_name(@deployment)
    @container      = fetch_container(@deployment)
    @img, @old_tag  = @container['image'].split(':')
  end

  def update
    @new_tag ||= increment_tag(@old_tag)
    @container['image'] = "#{@img}:#{@new_tag}"
    @container['env'].find {|env| env['name'] == 'IMAGE_VERSION'}['value'] = "#{@new_tag}"
  end

  def save
    File.open(@file, 'w') { |f| f.write(self.to_yaml) }
  end

  def update!
    update
    save
  end

  def to_yaml
    @deployment.to_yaml
  end

  private

  def fetch_app_name(deployment)
    deployment['metadata']['name']
  rescue => e
    puts "Yml file is corrupted: [metadata][name] is missing"
    raise e
  end

  def fetch_container(deployment)
    cs  = deployment['spec']['template']['spec']['containers']
    cid = @container_name ? cs.index { |c| c['name'] == @container_name } : 0
    cs[cid]
  rescue => e
    puts "Can't find the container to change"
    raise e
  end

  def parse_yaml(file)
    YAML.load_file(file)
  rescue => e
    puts 'Error parsing yaml'
    raise e
  end

  def increment_tag(prev_tag)
    unless prev_tag =~ /\d+-\d+-\d+/
      puts "Tag can't be incremented: #{prev_tag}\n" +
           "Proper format for tag is release-major-minor, e.g. 1-2-3"
      exit(1)
    end
    release, major, minor = prev_tag.split('-')
    if @major_update
      major = major.to_i + 1
    else
      minor = minor.to_i + 1
    end
    "#{release}-#{major}-#{minor}"
  end

end

options = {
  # Changes in deployment file
  tag: nil,
  file: nil,
  container: nil,
  increment: true,
  major_update: false,
  show_tag: false,
  # Commands to execute
  message: nil,
  commit: true,
  push: true,
  apply: true,
  prepend: false
}

OptionParser.new do |opts|
  opts.banner = "Usage: #{__FILE__} [options]"

  opts.on('-f', '--deployment_file file', 'Deployment') do |file|
    options[:file] = file
  end

  opts.on('-m', '--message message', 'Commit message') do |message|
    options[:message] = message
  end

  opts.on('-c', '--container container', 'Container') do |container|
    options[:container] = container
  end

  opts.on('-i', '--increment', 'Increment') do |increment|
    options[:increment] = true
  end

  opts.on('--major', 'Major release') do |increment|
    options[:major_update] = true
  end

  opts.on('-t', '--tag tag', 'Deployment tag') do |tag|
    options[:tag] = tag
    options[:increment] = false
  end

  opts.on('--[no-]commit', 'Commit changes') do |commit|
    options[:commit] = commit
  end

  opts.on('--[no-]push', 'Push changes') do |push|
    options[:push] = push
  end

  opts.on('-a', '--[no-]apply', 'Kubectl apply') do |apply|
    options[:apply] = apply
  end

  opts.on('--show', 'Show current tag of deployment') do |show|
    options[:show_tag] = true
  end

  opts.on('-p', '--prepend', 'Only show changed yml') do
    options[:commit] = false
    options[:push] = false
    options[:apply] = false
    options[:prepend] = true
  end

  opts.on('-h', '--help', 'Display Help') do
    puts opts
    exit
  end

end.parse!

if options[:file]
  options[:file] = File.expand_path(options[:file], Dir.pwd)
  puts "Reading file #{options[:file]}"
else
  options[:file] = File.expand_path('deploy/production.yml', Dir.pwd)
  puts "Reading default file: #{options[:file]}"
end

deployment = Deployment.new(options)

if options[:show_tag]
  puts "Current tag: #{deployment.old_tag}"
  exit(1)
end

deployment.update

puts "Updating deployment tag from #{deployment.old_tag} to #{deployment.new_tag} for #{deployment.app_name} app"
puts deployment.to_yaml and exit(1) if options[:prepend]

unless deployment.save
  puts "Write to #{options[:file]} failed!"
  exit(1)
end

def execute_cmd(cmd_hash, opts = {}, &block)
  res = `#{cmd_hash[:cmd] % opts}`
  opts.merge!(block.call(res)) if block
  puts cmd_hash[:success] % opts
rescue => e
  puts cmd_hash[:failure] % opts.merge(error_message: e.message)
  exit(1)
end

commit_message = options[:message] ||
  "Deploy: update #{deployment.app_name} to version #{deployment.new_tag}"

cmd_opts = {
  message: commit_message,
  file: options[:file],
  tag: deployment.new_tag,
  name: deployment.app_name
}

if options[:commit]
  commit = {
    failure: "Commit changes in %{file} failed with %{message}",
    success: "Commited changes in %{file} to branch %{branch} with id %{commit}",
    cmd: "git commit %{file} -m '%{message}'"
  }
  execute_cmd(commit, cmd_opts) do |res, opts|
    git = res.match(/^\[(?<branch>\S+) (?<commit>[a-z0-9]+)\]/)
    { commit: git['commit'], branch: git['branch'] }
  end
  tag = {
    failure: "Tagging new ref with %{tag} failed with %{message}",
    success: "Tagged new ref with %{tag}",
    cmd: "git tag -a %{tag} -m '%{message}'"
  }
  execute_cmd(tag, cmd_opts)
end

push = {
  failure: "Push in upstream failed with %{message}",
  success: "Pushed in upstream successfully",
  cmd: "git push && git push --tags"
}
execute_cmd(push) if options[:push]

apply = {
  failure: "Deployment %{name} with tag %{tag} failed with %{message}",
  success: "Deployment %{name} with tag %{tag} applied",
  cmd: "kubectl apply -f %{file}"
}
execute_cmd(apply, cmd_opts) if options[:apply]
